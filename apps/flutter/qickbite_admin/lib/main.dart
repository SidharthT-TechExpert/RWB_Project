import 'package:flutter/material.dart';

void main() {
  runApp(const QickbiteAdminApp());
}

class QickbiteAdminApp extends StatelessWidget {
  const QickbiteAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuickBite Platform SuperAdmin Portal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF030816),
        primaryColor: const Color(0xFFE11D48),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE11D48),
          secondary: Color(0xFF3B82F6),
          surface: Color(0xFF070D1F),
        ),
      ),
      home: const AdminHomeScreen(),
    );
  }
}

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  int _selectedIndex = 0;

  final List<Map<String, dynamic>> _pendingApprovals = [
    {
      'name': 'Gourmet House Bistro',
      'owner': 'Vikramaditya Rao',
      'email': 'contact@gourmethouse.com',
      'submitted': '2 hours ago',
      'city': 'Mumbai, MH',
    },
    {
      'name': 'Saffron Lounge',
      'owner': 'Neha Sharma',
      'email': 'neha@saffronlounge.in',
      'submitted': '5 hours ago',
      'city': 'Bengaluru, KA',
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
              decoration: BoxDecoration(color: Colors.rose.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.admin_panel_settings, color: Colors.roseAccent, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('QuickBite Platform Core', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('SUPERADMIN CONTROL CONSOLE', style: TextStyle(fontSize: 10, color: Colors.roseAccent, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // System Metrics Cards
            Row(
              children: [
                Expanded(child: _buildMetricCard('Platform GMV', '\$480.2K', 'This month', Icons.trending_up, Colors.emerald)),
                const SizedBox(width: 12),
                Expanded(child: _buildMetricCard('Active Partners', '142 Restaurants', '12 Pending', Icons.store, Colors.blue)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildMetricCard('Registered Users', '45.8K', '+1.2K this week', Icons.people, Colors.purple)),
                const SizedBox(width: 12),
                Expanded(child: _buildMetricCard('System Health', '99.98% Uptime', 'API Operational', Icons.verified, Colors.rose)),
              ],
            ),
            const SizedBox(height: 24),

            // Onboarding Approval Queue Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Restaurant Approvals Queue', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                Container(
                  padding: const EdgeInsets.horizontal(8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.rose.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                  child: Text('${_pendingApprovals.length} Pending', style: const TextStyle(color: Colors.roseAccent, fontWeight: FontWeight.bold, fontSize: 11)),
                )
              ],
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _pendingApprovals.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final p = _pendingApprovals[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF070D1F),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(p['name'], style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                          Text(p['submitted'], style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text('Owner: ${p['owner']} (${p['email']})', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      Text('Location: ${p['city']}', style: const TextStyle(fontSize: 12, color: Colors.white70)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.emerald),
                              onPressed: () {},
                              child: const Text('Approve Partner', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton(
                              style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.roseAccent)),
                              onPressed: () {},
                              child: const Text('Reject Application', style: TextStyle(color: Colors.roseAccent, fontSize: 12)),
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                );
              },
            )
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
        backgroundColor: const Color(0xFF070D1F),
        selectedItemColor: Colors.roseAccent,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Overview'),
          BottomNavigationBarItem(icon: Icon(Icons.how_to_reg), label: 'Approvals'),
          BottomNavigationBarItem(icon: Icon(Icons.group), label: 'Users'),
          BottomNavigationBarItem(icon: Icon(Icons.security), label: 'Audit Logs'),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, String sub, IconData icon, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF070D1F),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color[400], size: 20),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          Text(sub, style: TextStyle(fontSize: 10, color: color[400], fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
