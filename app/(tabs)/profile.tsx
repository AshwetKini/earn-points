import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  LogOut, 
  Settings,
  Star,
  Gift
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  points: number;
  created_at: string;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuth();

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

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMembershipLevel = (points: number) => {
    if (points >= 10000) return { level: 'Diamond', color: '#8B5CF6', icon: '💎' };
    if (points >= 5000) return { level: 'Gold', color: '#F59E0B', icon: '🏆' };
    if (points >= 1000) return { level: 'Silver', color: '#6B7280', icon: '🥈' };
    return { level: 'Bronze', color: '#92400E', icon: '🥉' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.gradient}>
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
      <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.gradient}>
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
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <LogOut size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.profileGradient}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <User size={40} color="#6366F1" />
                </View>
                {membershipInfo && (
                  <View style={styles.membershipBadge}>
                    <Text style={styles.membershipEmoji}>{membershipInfo.icon}</Text>
                    <Text style={[styles.membershipText, { color: membershipInfo.color }]}>
                      {membershipInfo.level}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.profileName}>
                {userProfile?.full_name || 'User'}
              </Text>
              
              <View style={styles.pointsContainer}>
                <Trophy size={20} color="#6366F1" />
                <Text style={styles.pointsText}>
                  {userProfile?.points.toLocaleString() || '0'} Points
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Mail size={20} color="#6366F1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userProfile?.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Calendar size={20} color="#6366F1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>
                    {userProfile ? formatDate(userProfile.created_at) : 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Gift size={20} color="#10B981" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Welcome Bonus</Text>
                  <Text style={styles.infoValue}>1,000 Points Earned</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
              <Settings size={20} color="#6366F1" />
              <Text style={styles.actionButtonText}>Account Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.signOutActionButton]} 
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <LogOut size={20} color="#EF4444" />
              <Text style={[styles.actionButtonText, styles.signOutActionText]}>
                Sign Out
              </Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  signOutButton: {
    padding: 8,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membershipBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  membershipEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  membershipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 24,
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 6,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 12,
  },
  signOutActionButton: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  signOutActionText: {
    color: '#EF4444',
  },
});