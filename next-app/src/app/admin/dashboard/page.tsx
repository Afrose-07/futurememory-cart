import React from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // Dummy Data for Preview
  const stats = {
    salesToday: 45200,
    ordersPending: 18,
    productsLowStock: 5,
    visitorsToday: 1240
  };

  const recentOrders = [
    { id: '#FMC-10023', customer: 'Arjun K', amount: 2499, status: 'Pending', items: 2 },
    { id: '#FMC-10024', customer: 'Priya R', amount: 899, status: 'Shipped', items: 1 },
    { id: '#FMC-10025', customer: 'Mohammed S', amount: 4500, status: 'Processing', items: 4 },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 font-sans">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex space-x-3">
          <Link href="/admin/products/new" className="px-5 py-2.5 bg-white border border-border text-foreground font-semibold rounded-xl hover:bg-gray-50 premium-shadow transition-all">
            + Upload Product
          </Link>
          <Link href="/admin/orders" className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-opacity-90 premium-shadow transition-all">
            View All Orders
          </Link>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl border border-border premium-shadow flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Sales Today</p>
          <h2 className="text-3xl font-black text-foreground">₹{stats.salesToday.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-green-600 mt-2 font-medium">↑ 12% from yesterday</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-border premium-shadow flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Orders Pending</p>
          <h2 className="text-3xl font-black text-orange-500">{stats.ordersPending}</h2>
          <p className="text-xs text-orange-600 mt-2 font-medium">Requires your attention</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border premium-shadow flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Low Stock Alerts</p>
          <h2 className="text-3xl font-black text-red-600">{stats.productsLowStock}</h2>
          <p className="text-xs text-red-600 mt-2 font-medium">Sizes nearly empty</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border premium-shadow flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Store Visitors Today</p>
          <h2 className="text-3xl font-black text-foreground">{stats.visitorsToday}</h2>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Across all languages</p>
        </div>

      </div>

      {/* Analytics & Sales Trends */}
      <div className="bg-white p-6 rounded-2xl border border-border premium-shadow mb-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Sales Analytics (Last 7 Days)</h3>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Bar Chart (CSS based for performance) */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-muted-foreground mb-4">Revenue Trends</h4>
            <div className="flex items-end space-x-2 md:space-x-4 h-48 border-b border-gray-200 pb-2">
              {[
                { day: 'Mon', h: '40%', val: '12k' },
                { day: 'Tue', h: '60%', val: '18k' },
                { day: 'Wed', h: '35%', val: '10k' },
                { day: 'Thu', h: '80%', val: '24k' },
                { day: 'Fri', h: '65%', val: '20k' },
                { day: 'Sat', h: '95%', val: '28k' },
                { day: 'Sun', h: '100%', val: '45k', active: true },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold mb-1 text-foreground">₹{bar.val}</div>
                  <div 
                    className={`w-full max-w-[40px] rounded-t-md transition-all ${bar.active ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'}`} 
                    style={{ height: bar.h }}
                  ></div>
                  <div className="text-xs font-medium text-muted-foreground mt-2">{bar.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="w-full md:w-1/3">
            <h4 className="text-sm font-semibold text-muted-foreground mb-4">Top Selling Categories</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-foreground">Men's Oversized</span>
                  <span className="font-bold">45%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-foreground">Women's Kurtas</span>
                  <span className="font-bold">30%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full opacity-80" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-foreground">Sneakers</span>
                  <span className="font-bold">15%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full opacity-60" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border premium-shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-foreground">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-semibold text-foreground">{order.id}</td>
                    <td className="py-4 text-foreground">{order.customer}</td>
                    <td className="py-4 text-muted-foreground">{order.items} Items</td>
                    <td className="py-4 font-bold text-foreground">₹{order.amount}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-primary font-medium text-sm hover:underline">Print Invoice</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Inventory Shortcuts */}
        <div className="bg-white rounded-2xl border border-border premium-shadow p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">Inventory Management</h3>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground">Manage Sizes & Colors</h4>
              <p className="text-xs text-muted-foreground mt-1">Update stock levels for 100+ unique products.</p>
            </div>
            <div className="p-4 border border-border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground">Add New Subcategory</h4>
              <p className="text-xs text-muted-foreground mt-1">Expand your catalog hierarchy.</p>
            </div>
            <div className="p-4 border border-border rounded-xl bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors border-primary/20">
              <h4 className="font-bold text-primary">Upload Product Images</h4>
              <p className="text-xs text-primary mt-1">Add 4-6 images (Front, Back, Close-up) for a product.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
