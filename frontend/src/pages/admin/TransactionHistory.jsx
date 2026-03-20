import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  IndianRupee, 
  Receipt, 
  TrendingUp, 
  CheckCircle, 
  Loader2,
  Calendar
} from 'lucide-react';
import './TransactionHistory.css';

const API_URL = 'http://localhost:3000/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [transRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/transactions?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true
        }),
        axios.get(`${API_URL}/transactions/summary?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true
        })
      ]);
      
      setTransactions(transRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      completed: 'secondary',
      cancelled: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="transaction-history">
      <div className="page-header animate-fade-in">
        <div>
          <h2>Transaction History</h2>
          <p className="page-subtitle">View and analyze revenue transactions</p>
        </div>
        <Tabs defaultValue="today" onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <Card className="summary-card animate-fade-in stagger-1">
          <CardContent className="p-6">
            <div className="summary-content">
              <div className="summary-icon revenue">
                <IndianRupee size={24} />
              </div>
              <div className="summary-info">
                <span className="summary-value">₹{parseFloat(summary?.total_revenue || 0).toFixed(2)}</span>
                <span className="summary-label">Total Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="summary-card animate-fade-in stagger-2">
          <CardContent className="p-6">
            <div className="summary-content">
              <div className="summary-icon transactions">
                <Receipt size={24} />
              </div>
              <div className="summary-info">
                <span className="summary-value">{summary?.total_transactions || 0}</span>
                <span className="summary-label">Total Transactions</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="summary-card animate-fade-in stagger-3">
          <CardContent className="p-6">
            <div className="summary-content">
              <div className="summary-icon average">
                <TrendingUp size={24} />
              </div>
              <div className="summary-info">
                <span className="summary-value">₹{parseFloat(summary?.average_order_value || 0).toFixed(2)}</span>
                <span className="summary-label">Average Order Value</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="summary-card animate-fade-in stagger-4">
          <CardContent className="p-6">
            <div className="summary-content">
              <div className="summary-icon completed">
                <CheckCircle size={24} />
              </div>
              <div className="summary-info">
                <span className="summary-value">{summary?.completed_orders || 0}</span>
                <span className="summary-label">Completed Orders</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="transactions-list animate-fade-in">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="loading">
              <Loader2 className="animate-spin mr-2" />
              Loading...
            </div>
          ) : transactions.length === 0 ? (
            <div className="no-transactions">
              <Receipt size={48} className="text-muted-foreground mb-4" />
              <p>No transactions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order No.</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((trans, index) => (
                  <TableRow key={trans.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
                    <TableCell className="font-medium">{trans.order_number}</TableCell>
                    <TableCell>{trans.table_number || 'N/A'}</TableCell>
                    <TableCell className="amount-cell">₹{parseFloat(trans.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(trans.status)}>
                        {trans.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trans.payment_status === 'completed' ? 'success' : 'warning'}>
                        {trans.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(trans.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
