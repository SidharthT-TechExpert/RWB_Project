import 'package:flutter/material.dart';

void main() {
  runApp(const QickbiteOwnerApp());
}

class QickbiteOwnerApp extends StatelessWidget {
  const QickbiteOwnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuickBite Executive Owner Portal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF030816),
        primaryColor: const Color(0xFF10B981),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF3B82F6),
          surface: Color(0xFF070D1F),
        ),
      ),
      home: const OwnerHomeScreen(),
    );
  }
}

class OwnerHomeScreen extends StatefulWidget {
  const OwnerHomeScreen({super.key});

  @override
  State<OwnerHomeScreen> createState() => _OwnerHomeScreenState();
}

class _OwnerHomeScreenState extends State<OwnerHomeScreen> {
  int _selectedIndex = 0;

  final List<Map<String, dynamic>> _branches = [
    {
      'name': 'Downtown Branch',
      'code': 'BR-NY-01',
      'manager': 'Neha Patel',
      'sales': '\$12,450',
      'orders': 340,
      'status': 'active',
    },
    {
      'name': 'Uptown Branch',
      'code': 'BR-NY-02',
      'manager': 'Priya Sharma',
      'sales': '\$9,820',
      'orders': 210,
      'status': 'active',
    },
    {
      'name': 'Brooklyn Heights Outlet',
      'code': 'BR-NY-03',
      'manager': 'Unassigned',
      'sales': '\$4,120',
      'orders': 95,
      'status': 'onboarding',
    },
  ];

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
              decoration: BoxDecoration(color: Colors.emerald.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.storefront, color: Colors.emeraldAccent, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Paragon Restaurant Group', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('EXECUTIVE OWNER PORTAL', style: TextStyle(fontSize: 10, color: Colors.emeraldAccent, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.add_business, color: Colors.emeraldAccent), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Revenue Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF022C22)]),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.emeraldAccent.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('TOTAL MONTHLY REVENUE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.emeraldAccent, letterSpacing: 1.2)),
                  const SizedBox(height: 6),
                  const Text('\$26,390.00', style: TextStyle(fontSize: 28, fontWeight: FontWeight.black, color: Colors.white)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('3 Active Outlets', style: TextStyle(fontSize: 12, color: Colors.white70)),
                      Text('+18.4% growth this month 📈', style: TextStyle(fontSize: 12, color: Colors.emeraldAccent, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Outlets Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Outlet Performance', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                TextButton(onPressed: () {}, child: const Text('+ Add Outlet', style: TextStyle(color: Colors.emeraldAccent))),
              ],
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _branches.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final b = _branches[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF070D1F),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(b['name'], style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                              const SizedBox(height: 2),
                              Text('Code: ${b['code']} • Manager: ${b['manager']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.horizontal(8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.emerald.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                            child: Text(b['sales'], style: const TextStyle(color: Colors.emeraldAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${b['orders']} Orders completed', style: const TextStyle(fontSize: 12, color: Colors.white70)),
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.emeraldAccent)),
                            onPressed: () {},
                            child: const Text('Manage Managers', style: TextStyle(color: Colors.emeraldAccent, fontSize: 11)),
                          ),
                        ],
                      )
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
        backgroundColor: const Color(0xFF070D1F),
        selectedItemColor: Colors.emeraldAccent,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.analytics), label: 'Analytics'),
          BottomNavigationBarItem(icon: Icon(Icons.store), label: 'Outlets'),
          BottomNavigationBarItem(icon: Icon(Icons.badge), label: 'Managers'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}
