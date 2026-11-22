
import { supabase } from './supabase';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, SafeAreaView, Image
} from 'react-native';

const initialProducts = [
  { id: 1, name: 'Classic Hoodie', price: 189000, category: 'Fashion', emoji: '🧥' },
  { id: 2, name: 'Everyday Sneakers', price: 259000, category: 'Shoes', emoji: '👟' },
  { id: 3, name: 'Minimalist Bag', price: 149000, category: 'Accessories', emoji: '👜' },
  { id: 4, name: 'Smart Watch', price: 399000, category: 'Electronics', emoji: '⌚' },
];

export default function App() {
  const [page, setPage] = useState('Home');
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const formatPrice = (price) =>
    'Rp ' + price.toLocaleString('id-ID');

  const addCart = (product) => {
    setCart([...cart, product]);
  };

  const [newProduct, setNewProduct] = useState({
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  image_url: ''
  
  });
  React.useEffect(() => {
  fetchProducts();
}, []);

async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    alert('Gagal mengambil produk: ' + error.message);
  } else {
    setProducts(data);
  }

  setLoading(false);
}

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const visibleProducts = products.filter(p =>
  p.name.toLowerCase().includes(search.toLowerCase())
  );

  const displayedProducts = page === 'Favorites'
    ? visibleProducts.filter(p => favorites.includes(p.id))
    : page === 'Cart'
    ? cart
    : visibleProducts;

  async function handleLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert('Login gagal: ' + error.message);
    return;
  }

  setUser(data.user);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    alert('Gagal mengambil role: ' + profileError.message);
    return;
  }

   setUserRole(profile.role);
   alert('Login berhasil!');
  }
  async function handleAddProduct() {
  if (!newProduct.name || !newProduct.price) {
    alert('Nama dan harga wajib diisi!');
    return;
  }


async function handleUpdateProduct() {
  if (!editingProduct.name || !editingProduct.price) {
    alert('Nama dan harga wajib diisi!');
    return;
  }

  const { error } = await supabase
    .from('products')
    .update({
      name: editingProduct.name,
      description: editingProduct.description,
      price: Number(editingProduct.price),
      category: editingProduct.category || 'Umum',
      stock: Number(editingProduct.stock) || 0,
      image_url: editingProduct.image_url
    })
    .eq('id', editingProduct.id);

  if (error) {
    alert('Gagal mengedit produk: ' + error.message);
    return;
  }

  alert('Produk berhasil diperbarui!');

  setEditingProduct(null);
  await fetchProducts();
  setPage('ManageProducts');
}


  const { error } = await supabase
    .from('products')
    .insert([{
      name: newProduct.name,
      description: newProduct.description,
      price: Number(newProduct.price),
      category: newProduct.category || 'Umum',
      stock: Number(newProduct.stock) || 0,
      image_url: newProduct.image_url,
    }]);

  if (error) {
    alert('Gagal: ' + error.message);
    return;
  }

  alert('Produk berhasil ditambahkan!');

  setNewProduct({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: ''
  });

  await fetchProducts();
  setPage('ManageProducts');
}

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>mimut<Text style={{color:'#E76F51'}}>.</Text></Text>
          <Text style={styles.subtitle}>Find your mimut and cute stuff here!</Text>
        </View>
        <TouchableOpacity onPress={() => setPage('Cart')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
    <Ionicons name="cart-outline" size={24} color="#263D35" />
    <Text>{cart.length}</Text>
  </View>
</TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {page === 'Home' && (
          <>
            <View style={styles.banner}>
              <Text style={styles.bannerSmall}>NEW COLLECTION</Text>
              <Text style={styles.bannerTitle}>Find Your{'\n'}Own Mimut Style.</Text>
              <Text style={styles.bannerDesc}>All products made for you.</Text>
            </View>
            <Text style={styles.heading}>Explore Products</Text>
          </>
        )}
        
        {['Home', 'Favorites', 'Cart'].includes(page) && (
          <>
        <TextInput
          style={styles.search}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.productGrid}>
          {displayedProducts.map(product => (
            <View key={product.id} style={styles.card}>
              <View style={styles.productImage}>
              {product.image_url ? (
                <Image
                source={{ uri: product.image_url }}
                style={{ width: '100%', height: '100%', borderRadius: 14}}
                resizeMode="cover"
                />
              ) : (
                <Ionicons name="image-outline" size={45} color="#999"
                />
              )}
              )}
                <TouchableOpacity
                  style={styles.heart}
                  onPress={() => toggleFavorite(product.id)}>
                  <Ionicons
                  name={favorites.includes(product.id) ? 'heart' : 'heart-outline'}
                  size={22}
                  color={favorites.includes(product.id) ? '#E76F51' : '#777'}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.category}>{product.category}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addCart(product)}>
                <Text style={styles.addText}>+ Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {displayedProducts.length === 0 && (
          <Text style={styles.empty}>No products found.</Text>
        )}
        </>
        )}

        {page === 'Cart' && (
          <View style={styles.total}>
            <Text style={styles.heading}>
              Total: {formatPrice(cart.reduce((sum,p) => sum+p.price,0))}
            </Text>
            <TouchableOpacity
              style={styles.checkout}
              onPress={() => {
                setCart([]);
                alert('Order placed successfully!');
              }}>
              <Text style={styles.addText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        )}

        {page === 'Profile' && (
  <View style={{padding: 20}}>
    {!user ? (
      <>
        <Text style={styles.heading}>Login Account</Text>
        
        <TextInput
          style={styles.search}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.search}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.checkout}
          onPress={handleLogin}
        >
          <Text style={styles.addText}>Login</Text>
        </TouchableOpacity>
      </>
    ) : (
      <>
        <Text style={styles.heading}>My Account</Text>
        <Text>{user.email}</Text>
        <Text>Role: {userRole}</Text>
        {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.checkout}
          onPress={() => setPage('ManageProducts')}
        >
          <Text style={styles.addText}>Manage Products</Text>
        </TouchableOpacity>
      )}
      </>
    )}
  </View>
)}
      {page === 'ManageProducts' && (
  <View style={{padding: 20}}>
    <Text style={styles.heading}>Manage Products</Text>

    <TouchableOpacity
      style={styles.checkout}
      onPress={() => setPage('AddProduct')}
    >
      <Text style={styles.addText}>+ Add New Product</Text>
    </TouchableOpacity>

    {products.map(product => (
      <View key={product.id} style={{
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12
      }}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text>{formatPrice(product.price)}</Text>
        <Text>Stock: {product.stock}</Text>

        <TouchableOpacity
          onPress={() => alert('Fitur edit akan dibuat berikutnya')}
        >
          <Text style={{color: '#263D35', marginTop: 10}}>
            Edit Product
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => alert('Fitur hapus akan dibuat berikutnya')}
        >
          <Text style={{color: '#E76F51', marginTop: 8}}>
            Delete Product
          </Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
)}


{page === 'AddProduct' && (
  <View style={{ padding: 20 }}>
    <Text style={styles.heading}>Add New Product</Text>

    <TextInput
      style={styles.search}
      placeholder="Product Name"
      value={newProduct.name}
      onChangeText={v => setNewProduct({...newProduct, name: v})}
    />

    <TextInput
      style={styles.search}
      placeholder="Description"
      value={newProduct.description}
      onChangeText={v => setNewProduct({...newProduct, description: v})}
    />

    <TextInput
      style={styles.search}
      placeholder="Price"
      keyboardType="numeric"
      value={newProduct.price}
      onChangeText={v => setNewProduct({...newProduct, price: v})}
    />

    <TextInput
      style={styles.search}
      placeholder="Category"
      value={newProduct.category}
      onChangeText={v => setNewProduct({...newProduct, category: v})}
    />

    <TextInput
      style={styles.search}
      placeholder="Stock"
      keyboardType="numeric"
      value={newProduct.stock}
      onChangeText={v => setNewProduct({...newProduct, stock: v})}
    />

    <TextInput
      style={styles.search}
      placeholder="Image URL"
      value={newProduct.image_url}
      onChangeText={v => setNewProduct({...newProduct, image_url: v})}
    />

    <TouchableOpacity
      style={styles.checkout}
      onPress={handleAddProduct}
    >
      <Text style={styles.addText}>Save Product</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => setPage('ManageProducts')}
      style={{ padding: 15, alignItems: 'center' }}
    >
      <Text>Cancel</Text>
    </TouchableOpacity>
  </View>
)}

      </ScrollView>

      <View style={styles.nav}>
        {[
          ['Home','home-outline'],
          ['Favorites','heart-outline'],
          ['Cart','cart-outline'],
          ['Profile','person-outline']
        ].map(([name, icon]) => (
          <TouchableOpacity
            key={name}
            style={styles.navItem}
            onPress={() => {
              setPage(name);
              setSearch('');
            }}>
            <Ionicons
            name={icon}
            size={23}
            color={page === name ? '#E76F51' : '#999'}
            />
            <Text style={{
              fontSize:11,
              color:page === name ? '#E76F51' : '#999',
              fontWeight:'600'
            }}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#FAF8F5'},
  header:{padding:22,paddingTop:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  logo:{fontSize:30,fontWeight:'900',color:'#242424'},
  subtitle:{fontSize:12,color:'#888',marginTop:3},
  cartIcon:{fontSize:18},
  banner:{backgroundColor:'#660033',margin:18,marginTop:5,borderRadius:20,padding:25},
  bannerSmall:{color:'#D9B98B',fontSize:11,letterSpacing:2,fontWeight:'bold'},
  bannerTitle:{fontSize:36,fontWeight:'bold',color:'white',marginTop:12},
  bannerDesc:{color:'#D9DED9',marginTop:8},
  heading:{fontSize:21,fontWeight:'bold',color:'#252525',marginHorizontal:20,marginTop:18,marginBottom:12},
  search:{backgroundColor:'white',marginHorizontal:20,marginVertical:12,padding:15,borderRadius:12,fontSize:14},
  productGrid:{flexDirection:'row',flexWrap:'wrap',paddingHorizontal:12},
  card:{width:'50%',padding:8,marginBottom:10},
  productImage:{height:145,backgroundColor:'#EEEAE4',borderRadius:14,justifyContent:'center',alignItems:'center'},
  heart:{position:'absolute',top:10,right:10},
  category:{fontSize:11,color:'#999',marginTop:10},
  productName:{fontSize:14,fontWeight:'bold',color:'#292929',marginTop:4},
  price:{fontSize:14,fontWeight:'bold',color:'#263D35',marginTop:5},
  addButton:{backgroundColor:'#440022',padding:11,borderRadius:9,marginTop:10,alignItems:'center'},
  addText:{color:'white',fontWeight:'bold',fontSize:12},
  nav:{height:68,backgroundColor:'white',flexDirection:'row',justifyContent:'space-around',alignItems:'center',borderTopWidth:1,borderColor:'#EEE'},
  navItem:{alignItems:'center',gap:3},
  empty:{textAlign:'center',margin:40,color:'#999'},
  total:{padding:20},
  checkout:{backgroundColor:'#263D35',padding:16,borderRadius:12,alignItems:'center',marginTop:15},
  profile:{alignItems:'center',padding:35}
});
