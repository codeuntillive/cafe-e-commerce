import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../zustnd/store';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Plus, Pencil, Trash2, Image, Loader2 } from 'lucide-react';
import './MenuManagement.css';

const MenuManagement = () => {
  const { menuItems, fetchMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, isLoading } = useAdminStore();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main',
    image_url: '',
    is_available: true
  });

  const categories = ['appetizer', 'main', 'dessert', 'drinks'];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
        toast.success('Menu item updated!');
      } else {
        await addMenuItem(formData);
        toast.success('Menu item added!');
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const result = await deleteMenuItem(id);
        toast.success(result?.message || 'Menu item deleted!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete item');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || 'main',
      image_url: item.image_url || '',
      is_available: item.is_available
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'main',
      image_url: '',
      is_available: true
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const getCategoryColor = (category) => {
    const colors = {
      appetizer: 'bg-orange-100 text-orange-800',
      main: 'bg-blue-100 text-blue-800',
      dessert: 'bg-pink-100 text-pink-800',
      drinks: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="menu-management">
      <div className="page-header animate-fade-in">
        <div>
          <h2>Menu Management</h2>
          <p className="page-subtitle">Manage your restaurant menu items</p>
        </div>
        <Button onClick={openAddModal} className="add-btn">
          <Plus size={18} />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="loading">
          <Loader2 className="animate-spin mr-2" />
          Loading menu...
        </div>
      ) : (
        <div className="menu-categories">
          {categories.map((category, catIndex) => (
            groupedItems[category] && (
              <div key={category} className="category-section animate-fade-in" style={{ animationDelay: `${catIndex * 0.1}s` }}>
                <div className="category-header">
                  <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                  <Badge variant="secondary">{groupedItems[category].length} items</Badge>
                </div>
                <div className="menu-grid">
                  {groupedItems[category].map((item, index) => (
                    <Card 
                      key={item.id} 
                      className={`menu-item-card ${!item.is_available ? 'unavailable' : ''} animate-scale-in`}
                      style={{ animationDelay: `${(catIndex * 0.1) + (index * 0.05)}s` }}
                    >
                      <div className="item-image">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} />
                        ) : (
                          <div className="no-image">
                            <Image size={48} />
                          </div>
                        )}
                        {!item.is_available && (
                          <div className="unavailable-badge">
                            Unavailable
                          </div>
                        )}
                        <Badge className={`category-badge ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </Badge>
                      </div>
                      <CardContent className="item-info">
                        <h4>{item.name}</h4>
                        <p className="description">{item.description}</p>
                        <div className="item-footer">
                          <span className="price">₹{item.price}</span>
                          <div className="actions">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="edit-btn"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="delete-btn"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Enter item name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    required
                    placeholder="0.00"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="form-select"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={e => setFormData({...formData, is_available: e.target.checked})}
                  className="checkbox"
                />
                <Label htmlFor="is_available" className="mb-0">
                  Available for ordering
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
