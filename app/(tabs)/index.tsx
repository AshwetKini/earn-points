import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Star, Gift, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  points: number;
  created_at: string;
}

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  const getMembershipLevel = (points: number) => {
    if (points >= 10000) return { level: 'Diamond', color: '#8B5CF6' };
    if (points >= 5000) return { level: 'Gold', color: '#F59E0B' };
    if (points >= 1000) return { level: 'Silver', color: '#6B7280' };
    return { level: 'Bronze', color: '#92400E' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const membershipInfo = userProfile ? getMembershipLevel(userProfile.points) : null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>
              {userProfile?.full_name || 'User'}!
            </Text>
          </View>

          <View style={styles.pointsCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.pointsGradient}
            >
              <View style={styles.pointsHeader}>
                <Trophy size={32} color="#3B82F6" />
                <Text style={styles.pointsLabel}>Your Points</Text>
              </View>
              <Text style={styles.pointsValue}>
                {userProfile ? formatPoints(userProfile.points) : '0'}
              </Text>
              {membershipInfo && (
                <View style={styles.membershipBadge}>
                  <Star size={16} color={membershipInfo.color} />
                  <Text style={[styles.membershipText, { color: membershipInfo.color }]}>
                    {membershipInfo.level} Member
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.statGradient}
              >
                <Gift size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>1,000</Text>
                <Text style={styles.statLabel}>Welcome Bonus</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.statGradient}
              >
                <TrendingUp size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>
                  {userProfile ? Math.floor(userProfile.points / 100) : '0'}
                </Text>
                <Text style={styles.statLabel}>Level</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How to Earn More Points</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Complete daily tasks</Text>
              <Text style={styles.infoItem}>• Refer friends</Text>
              <Text style={styles.infoItem}>• Share achievements</Text>
              <Text style={styles.infoItem}>• Stay active</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  pointsCard: {
    marginBottom: 24,
  },
  pointsGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsLabel: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 12,
  },
  pointsValue: {
    fontSize: 48,
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  statGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoList: {
    marginTop: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
});