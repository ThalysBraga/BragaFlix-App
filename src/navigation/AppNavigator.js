import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchScreen from '../screens/SearchScreen';
import DetailsScreen from '../screens/DetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import { useFavorites } from '../context/FavoritesContext';

const Stack = createNativeStackNavigator();
const TopTab = createMaterialTopTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0a0a0c',
    card: '#0a0a0c',
    text: '#f3f4f6',
    border: 'rgba(255,255,255,0.06)',
    primary: '#e50914',
  },
  dark: true,
};

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const { favorites } = useFavorites();

  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: bottomInset, height: 58 + bottomInset },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const isFavorites = route.name === 'Favorites';
        const label = isFavorites ? 'Favoritos' : 'Buscar';
        const glyph = isFavorites ? '♥' : '🔎';
        const color = focused ? '#e50914' : '#6b7280';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapFocused]}>
              <Text style={[styles.tabIcon, { color }]}>{glyph}</Text>
              {isFavorites && favorites.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {favorites.length > 99 ? '99+' : favorites.length}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <TopTab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        lazy: false,
      }}
    >
      <TopTab.Screen name="Search" component={SearchScreen} />
      <TopTab.Screen name="Favorites" component={FavoritesScreen} />
    </TopTab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0c' },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0c',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabIconWrapFocused: {
    backgroundColor: 'rgba(229,9,20,0.12)',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e50914',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});
