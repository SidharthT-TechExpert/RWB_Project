import 'package:flutter/material.dart';

void main() {
  runApp(const QickbiteManagerApp());
}

class QickbiteManagerApp extends StatelessWidget {
  const QickbiteManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuickBite Branch Manager Portal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF030816),
        primaryColor: const Color(0xFF3B82F6),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF3B82F6),
          secondary: Color(0xFF8B5CF6),
          surface: Color(0xFF070D1F),
        ),
      ),
      home: const ManagerHomeScreen(),
    );
  }
}

class ManagerHomeScreen extends StatefulWidget {
  const ManagerHomeScreen({super.key});

  @override
  State<ManagerHomeScreen> createState() => _ManagerHomeScreenState();
}

class _ManagerHomeScreenState extends State<ManagerHomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _kdsOrders = [
    {
      'orderNo': '#ORD-1089',
      'table': 'Table 04',
      'guest': 'Rohan Sharma',
      'items': '2x Butter Chicken, 4x Garlic Naan',
      'timeAgo': '2m ago',
      'status': 'pending',
      'total': '\$48.50',
    },
    {
      'orderNo': '#ORD-1088',
      'table': 'Table 12',
      'guest': 'Ananya Verma',
      'items': '1x Paneer Tikka Platter, 2x Fresh Lime Soda',
      'timeAgo': '8m ago',
      'status': 'cooking',
      'total': '\$26.00',
    },
    {
      'orderNo': '#ORD-1087',
      'table': 'Table 08',
      'guest': 'Vikram Singh',
      'items': '2x Chicken Dum Biryani, 1x Mirchi Ka Salan',
      'timeAgo': '14m ago',
      'status': 'ready',
      'total': '\$72.00',
    },
  ];

  final List<Map<String, dynamic>> _tables = [
    {'tableNo': 'T-01', 'seats': 2, 'status': 'occupied', 'guest': 'Neha Patel'},
    {'tableNo': 'T-02', 'seats': 4, 'status': 'available', 'guest': null},
    {'tableNo': 'T-03', 'seats': 4, 'status': 'reserved', 'guest': 'Rahul M.'},
    {'tableNo': 'T-04', 'seats': 6, 'status': 'occupied', 'guest': 'Rohan Sharma'},
    {'tableNo': 'T-05', 'seats': 2, 'status': 'cleaning', 'guest': null},
    {'tableNo': 'T-06', 'seats': 4, 'status': 'available', 'guest': null},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF070D1F),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.soup_kitchen, color: Colors.blueAccent, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Uptown Branch [BR-NY-02]', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('BRANCH MANAGER PORTAL', style: TextStyle(fontSize: 10, color: Colors.blueAccent, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.blueAccent,
          labelColor: Colors.blueAccent,
          unselectedLabelColor: Colors.grey,
          labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
          tabs: const [
            Tab(icon: Icon(Icons.dashboard_outlined), text: 'Overview'),
            Tab(icon: Icon(Icons.soup_kitchen_outlined), text: 'KDS Live'),
            Tab(icon: Icon(Icons.table_restaurant_outlined), text: 'Floor Tables'),
            Tab(icon: Icon(Icons.restaurant_menu_outlined), text: 'Stock Menu'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildKdsTab(),
          _buildTablesTab(),
          _buildMenuStockTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // KPI Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _buildKpiCard('Today\'s Sales', '\$1,840.50', '+14.2% vs yest', Icons.attach_money, Colors.emerald),
              _buildKpiCard('Active KDS Queue', '${_kdsOrders.length} Orders', '2 in kitchen', Icons.soup_kitchen, Colors.blue),
              _buildKpiCard('Table Occupancy', '75% (18/24)', '4 Tables Free', Icons.table_restaurant, Colors.purple),
              _buildKpiCard('Staff on Shift', '8 Active', '4 Waiters, 3 Chefs', Icons.people, Colors.amber),
            ],
          ),
          const SizedBox(height: 20),

          const Text('Quick Operations', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent, padding: const EdgeInsets.all(14)),
                  onPressed: () {},
                  icon: const Icon(Icons.person_add, size: 18),
                  label: const Text('Walk-in Checkin', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.amber[700], padding: const EdgeInsets.all(14)),
                  onPressed: () {},
                  icon: const Icon(Icons.local_fire_department, size: 18),
                  label: const Text('Rush Mode', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildKdsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _kdsOrders.length,
      itemBuilder: (context, index) {
        final o = _kdsOrders[index];
        Color statusColor = Colors.amber;
        if (o['status'] == 'cooking') statusColor = Colors.blueAccent;
        if (o['status'] == 'ready') statusColor = Colors.emerald;

        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF070D1F),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: statusColor.withOpacity(0.4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(o['orderNo'], style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: statusColor)),
                  Container(
                    padding: const EdgeInsets.horizontal(8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(8)),
                    child: Text(o['table'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text('Guest: ${o['guest']}', style: const TextStyle(fontSize: 13, color: Colors.grey)),
              const SizedBox(height: 6),
              Text(o['items'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(o['timeAgo'], style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: statusColor, foregroundColor: Colors.black),
                    onPressed: () {},
                    child: Text(
                      o['status'] == 'pending' ? 'Start Cooking' : o['status'] == 'cooking' ? 'Mark Ready' : 'Serve Table',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildTablesTab() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.2,
      ),
      itemCount: _tables.length,
      itemBuilder: (context, index) {
        final t = _tables[index];
        Color color = Colors.emerald;
        if (t['status'] == 'occupied') color = Colors.rose;
        if (t['status'] == 'reserved') color = Colors.amber;
        if (t['status'] == 'cleaning') color = Colors.purple;

        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withOpacity(0.4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(t['tableNo'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text('${t['seats']} Seats', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(t['status'].toString().toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
                  if (t['guest'] != null)
                    Text(t['guest'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white), overflow: TextOverflow.ellipsis),
                ],
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildMenuStockTab() {
    final dishes = [
      {'name': 'Truffle Mushroom Risotto', 'cat': 'Chef Specials', 'price': '₹450', 'inStock': true},
      {'name': 'Wood-Fired Margherita Pizza', 'cat': 'Pizzas', 'price': '₹380', 'inStock': true},
      {'name': 'Grilled Angus Ribeye Steak', 'cat': 'Main Course', 'price': '₹890', 'inStock': false},
    ];

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: dishes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final d = dishes[index];
        final inStock = d['inStock'] as bool;
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF070D1F),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(d['name'].toString(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text('${d['cat']} • ${d['price']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
              Switch(
                value: inStock,
                activeColor: Colors.emeraldAccent,
                onChanged: (v) {},
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildKpiCard(String title, String value, String sub, IconData icon, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF070D1F),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
              Icon(icon, color: color[400], size: 18),
            ],
          ),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black, color: Colors.white)),
          Text(sub, style: TextStyle(fontSize: 10, color: color[400], fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
