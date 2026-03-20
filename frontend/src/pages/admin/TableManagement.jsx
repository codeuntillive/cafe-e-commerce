import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../zustnd/store';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
import { Plus, Download, Power, Trash2, Users, Link, Loader2 } from 'lucide-react';
import './TableManagement.css';

const TableManagement = () => {
  const { tables, fetchTables, addTable, updateTable, deleteTable, isLoading } = useAdminStore();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 4
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addTable(formData);
      toast.success('Table added successfully!');
      setShowModal(false);
      setFormData({ table_number: '', capacity: 4 });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add table');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await deleteTable(id);
        toast.success('Table deleted!');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete table');
      }
    }
  };

  const handleToggleActive = async (table) => {
    try {
      await updateTable(table.id, { is_active: !table.is_active });
      toast.success(`Table ${table.is_active ? 'deactivated' : 'activated'}!`);
    } catch (err) {
      toast.error('Failed to update table');
    }
  };

  const downloadQR = (table) => {
    const svg = document.getElementById(`qr-${table.id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `table-${table.table_number}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="table-management">
      <div className="page-header animate-fade-in">
        <div>
          <h2>Table Management</h2>
          <p className="page-subtitle">Manage restaurant tables and QR codes</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Table
        </Button>
      </div>

      {isLoading ? (
        <div className="loading">
          <Loader2 className="animate-spin mr-2" />
          Loading tables...
        </div>
      ) : tables.length === 0 ? (
        <Card className="no-tables">
          <CardContent className="py-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p>No tables added yet. Click "Add Table" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="tables-grid">
          {tables.map((table, index) => (
            <Card 
              key={table.id} 
              className={`table-card ${!table.is_active ? 'inactive' : ''} animate-scale-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="pb-2">
                <div className="table-header">
                  <CardTitle>{table.table_number}</CardTitle>
                  <Badge variant={table.is_active ? 'success' : 'destructive'}>
                    {table.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="table-info">
                  <div className="info-item">
                    <Users size={16} />
                    <span>Capacity: <strong>{table.capacity} persons</strong></span>
                  </div>
                  <div className="info-item link">
                    <Link size={16} />
                    <code>/table/{table.unique_link}</code>
                  </div>
                </div>
                
                <div className="qr-section">
                  {table.qr_code_url ? (
                    <QRCodeSVG 
                      id={`qr-${table.id}`}
                      value={`http://localhost:5173/table/${table.unique_link}`}
                      size={140}
                      level="M"
                      includeMargin={true}
                    />
                  ) : (
                    <div className="qr-placeholder">
                      <Loader2 className="animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="table-actions">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadQR(table)}
                    title="Download QR Code"
                  >
                    <Download size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleActive(table)}
                    className={table.is_active ? 'text-orange-500' : 'text-green-500'}
                  >
                    <Power size={16} />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(table.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="table_number">Table Number *</Label>
                <Input
                  id="table_number"
                  value={formData.table_number}
                  onChange={e => setFormData({...formData, table_number: e.target.value})}
                  placeholder="e.g., Table 1, T1, A1"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                />
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
                Add Table
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableManagement;
