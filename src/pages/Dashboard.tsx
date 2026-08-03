import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Daily Revenue</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-slate-800">$1,245.80</h3>
            <span className="text-xs text-green-600 font-medium mb-1">+12% &uarr;</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[65%]"></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Sales</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-slate-800">48</h3>
            <span className="text-xs text-slate-400 font-medium mb-1">transactions</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">18 products / 30 services</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Services</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-slate-800">12</h3>
            <span className="text-xs text-blue-600 font-medium mb-1">In Progress</span>
          </div>
          <div className="mt-4 flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white"></div>
            <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white"></div>
            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white"></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm ring-2 ring-red-50">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Low Stock Alerts</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-red-700">06</h3>
            <span className="text-xs text-red-500 font-medium mb-1 font-bold">Requires Action</span>
          </div>
          <p className="mt-2 text-[11px] text-red-400">Critical: Photo Paper, 9V Batteries</p>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Sales Table */}
        <div className="col-span-1 lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-700">Recent Transactions</h3>
            <button className="text-blue-600 text-xs font-medium hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 font-semibold">Order ID</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Items / Services</th>
                  <th className="px-6 py-3 font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
                <tr>
                  <td className="px-6 py-3 font-mono text-xs">#TXN-8842</td>
                  <td className="px-6 py-3">Sarah Williams</td>
                  <td className="px-6 py-3">Passport Photo (4x), USB Cable</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">$45.00</td>
                  <td className="px-6 py-3"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] rounded-md font-medium uppercase">Completed</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-xs">#TXN-8841</td>
                  <td className="px-6 py-3">Mark Thompson</td>
                  <td className="px-6 py-3">Photo Printing (A4 Color)</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">$12.50</td>
                  <td className="px-6 py-3"><span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] rounded-md font-medium uppercase">Pending</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-xs">#TXN-8840</td>
                  <td className="px-6 py-3">Jessica Chen</td>
                  <td className="px-6 py-3">Photo Editing, AA Battery Pack</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">$85.00</td>
                  <td className="px-6 py-3"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] rounded-md font-medium uppercase">Completed</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-xs">#TXN-8839</td>
                  <td className="px-6 py-3">Walk-in Customer</td>
                  <td className="px-6 py-3">1x1 ID Photo</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">$8.00</td>
                  <td className="px-6 py-3"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] rounded-md font-medium uppercase">Completed</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-xs">#TXN-8838</td>
                  <td className="px-6 py-3">David Miller</td>
                  <td className="px-6 py-3">Scanning (15 pages), Lamination</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">$22.75</td>
                  <td className="px-6 py-3"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] rounded-md font-medium uppercase">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Inventory & Top Services */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-4">Top Selling Services</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">01</div>
                  <span className="text-sm font-medium">Passport Photos</span>
                </div>
                <span className="text-xs text-slate-400">142 sold</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs">02</div>
                  <span className="text-sm font-medium">A4 Color Printing</span>
                </div>
                <span className="text-xs text-slate-400">98 sold</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs">03</div>
                  <span className="text-sm font-medium">Scanning</span>
                </div>
                <span className="text-xs text-slate-400">76 sold</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <h3 className="font-semibold text-blue-400 text-sm mb-3">Inventory Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                  <span>Physical Stock</span>
                  <span>84%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[84%]"></div>
                </div>
              </div>
              <div className="pt-2">
                <button className="w-full py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                  Generate Low Stock Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
