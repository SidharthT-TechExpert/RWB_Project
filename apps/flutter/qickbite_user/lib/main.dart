import 'package:flutter/material.dart';

void main() {
  runApp(const QickbiteUserApp());
}

class QickbiteUserApp extends StatelessWidget {
  const QickbiteUserApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuickBite Food & Dining',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF030816),
        primaryColor: const Color(0xFF3B82F6),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF3B82F6),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF070D1F),
        ),
      ),
      home: const UserHomeScreen(),
    );
  }
}

class UserHomeScreen extends StatefulWidget {
  const UserHomeScreen({super.key});

  @override
  State<UserHomeScreen> createState() => _UserHomeScreenState();
}

class _UserHomeScreenState extends State<UserHomeScreen> {
  int _selectedIndex = 0;

  final List<Map<String, dynamic>> _restaurants = [
    {
      'name': 'Paragon Fine Dining',
      'cuisine': 'North Indian • Continental',
      'rating': 4.9,
      'time': '25-30 min',
      'image': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    },
    {
      'name': 'The Woodfired Oven',
      'cuisine': 'Artisanal Pizza • Italian',
      'rating': 4.8,
      'time': '20-25 min',
      'image': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    },
    {
      'name': 'Spice Route Kitchen',
      'cuisine': 'Biryani • South Indian',
      'rating': 4.7,
      'time': '30-35 min',
      'image': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0',
    },
  ];

  final List<Map<String, dynamic>> _activeOrders = [
    {
      'id': '#ORD-1089',
      'restaurant': 'Paragon Fine Dining',
      'status': 'Preparing in Kitchen',
      'items': '2x Butter Chicken, 4x Garlic Naan',
      'total': '\$48.50',
      'progress': 0.5,
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF070D1F),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'DELIVER TO',
              style: TextStyle(fontSize: 10, color: Colors.blueAccent, fontWeight: FontWeight.bold, letterSpacing: 1.2),
            ),
            Text(
              'Downtown, 45 Park Avenue 📍',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.account_balance_wallet_outlined, color: Colors.emeraldAccent),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar
            Container(
              padding: const EdgeInsets.horizontal(16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF0A1227),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                children: const [
                  Icon(Icons.search, color: Colors.grey),
                  SizedBox(width: 12),
                  Text('Search dish, restaurant or cuisine...', style: TextStyle(color: Colors.grey, fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Active Order Live Banner
            if (_activeOrders.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E1B4B), Color(0xFF0F172A)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.local_fire_department, color: Colors.amber, size: 20),
                            SizedBox(width: 6),
                            Text('LIVE ORDER TRACKING', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.horizontal(8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                          child: Text(_activeOrders[0]['id'], style: const TextStyle(color: Colors.blueAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(_activeOrders[0]['restaurant'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                    Text(_activeOrders[0]['status'], style: const TextStyle(fontSize: 13, color: Colors.emeraldAccent, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 12),
                    LinearProgressIndicator(value: _activeOrders[0]['progress'], backgroundColor: Colors.white10, color: Colors.emeraldAccent),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Section Header: Quick Services
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Dining & Order Options', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ],
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(child: _buildServiceCard(Icons.delivery_dining, 'Delivery', 'Get food delivered', Colors.blue)),
                const SizedBox(width: 12),
                Expanded(child: _buildServiceCard(Icons.table_restaurant, 'Table Booking', 'Reserve seat', Colors.purple)),
                const SizedBox(width: 12),
                Expanded(child: _buildServiceCard(Icons.shopping_bag, 'Takeaway', 'Self pickup', Colors.emerald)),
              ],
            ),
            const SizedBox(height: 24),

            // Nearby Restaurants
            const Text('Featured Restaurants', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _restaurants.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final r = _restaurants[index];
                return Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF070D1F),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 140,
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                          image: DecorationImage(image: NetworkImage(r['image']), fit: BoxFit.cover),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(r['name'], style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                                const SizedBox(height: 4),
                                Text(r['cuisine'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.horizontal(8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.emerald.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                              child: Row(
                                children: [
                                  const Icon(Icons.star, color: Colors.emeraldAccent, size: 14),
                                  const SizedBox(width: 4),
                                  Text('${r['rating']}', style: const TextStyle(color: Colors.emeraldAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                                ],
                              ),
                            ),
                          ],
                        ),
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
        selectedItemColor: Colors.blueAccent,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Explore'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.event_seat), label: 'Bookings'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildServiceCard(IconData icon, String title, String subtitle, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color[400], size: 24),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
          Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }
}
