import { collection, getDocs, addDoc, serverTimestamp, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { Product, ProductTier } from './productService';
import { Vouch } from './vouchService';
import { Timestamp } from 'firebase/firestore';
import { ProductType, ProductCategory, DeliveryMethod } from './productService';

// Sample products data
const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Steam Gift Cards',
    description: 'Get Steam gift cards at discounted prices',
    imageURL: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1343400/header.jpg',
    type: 'currency' as ProductType,
    category: 'gift-card' as ProductCategory,
    deliveryMethod: 'code' as DeliveryMethod,
    inStock: true,
    featured: true,
    tiers: [
      {
        id: 'tier_1',
        name: '$10 Steam Card',
        price: 10.99,
        description: '$10 Steam Wallet Code',
        inStock: true
      },
      {
        id: 'tier_2',
        name: '$25 Steam Card',
        price: 26.99,
        description: '$25 Steam Wallet Code',
        inStock: true
      },
      {
        id: 'tier_3',
        name: '$50 Steam Card',
        price: 52.99,
        description: '$50 Steam Wallet Code',
        inStock: true
      }
    ]
  },
  {
    name: 'PlayStation Plus',
    description: 'PlayStation Plus subscriptions at Turkish prices',
    imageURL: 'https://image.api.playstation.com/vulcan/ap/rnd/202008/1420/HGomfGXTYm91L1CSYG3TI5V8.png',
    type: 'subscription' as ProductType,
    category: 'gaming' as ProductCategory,
    deliveryMethod: 'code' as DeliveryMethod,
    inStock: true,
    featured: true,
    tiers: [
      {
        id: 'tier_1',
        name: '1 Month',
        price: 9.99,
        description: '1 Month PlayStation Plus Essential',
        inStock: true
      },
      {
        id: 'tier_2',
        name: '3 Months',
        price: 24.99,
        description: '3 Months PlayStation Plus Essential',
        inStock: true
      },
      {
        id: 'tier_3',
        name: '12 Months',
        price: 59.99,
        description: '12 Months PlayStation Plus Essential',
        inStock: true
      }
    ]
  },
  {
    name: 'Xbox Game Pass Ultimate',
    description: 'Xbox Game Pass Ultimate subscriptions',
    imageURL: 'https://store-images.s-microsoft.com/image/apps.10341.13727851868390641.c9409c36-dc22-4b0d-8b75-90b61d97fccc.b029bd80-6951-47f9-92cd-20aeca16818f',
    type: 'subscription' as ProductType,
    category: 'gaming' as ProductCategory,
    deliveryMethod: 'code' as DeliveryMethod,
    inStock: true,
    featured: false,
    tiers: [
      {
        id: 'tier_1',
        name: '1 Month',
        price: 14.99,
        description: '1 Month Xbox Game Pass Ultimate',
        inStock: true
      },
      {
        id: 'tier_2',
        name: '3 Months',
        price: 39.99,
        description: '3 Months Xbox Game Pass Ultimate',
        inStock: true
      }
    ]
  }
];

// Sample vouches data
const sampleVouches: Omit<Vouch, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'John Smith',
    email: 'john@example.com',
    platform: 'Website',
    rating: 5,
    message: 'Excellent service! Got my Steam code within minutes. Will definitely use again.',
    status: 'approved',
    isManual: false
  },
  {
    name: 'Emma Wilson',
    platform: 'Discord',
    rating: 5,
    message: 'Fast delivery and great prices. The best place to buy gaming gift cards!',
    status: 'approved',
    isManual: false
  },
  {
    name: 'Michael Brown',
    email: 'michael@example.com',
    platform: 'Website',
    rating: 4,
    message: 'Good service, received my PlayStation Plus code quickly. Would recommend.',
    status: 'approved',
    isManual: false
  },
  {
    name: 'Sarah Davis',
    platform: 'Instagram',
    rating: 5,
    message: 'Amazing! Super fast and reliable. Customer support was very helpful too.',
    status: 'approved',
    isManual: true
  }
];

/**
 * Initialize the database with sample data if collections are empty
 */
export const initializeDatabase = async (skipIfExists: boolean = true): Promise<{
  productsCreated: number;
  vouchesCreated: number;
}> => {
  let productsCreated = 0;
  let vouchesCreated = 0;

  try {
    // Check products collection
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    if (!skipIfExists || productsSnapshot.empty) {
      console.log('Initializing products collection...');
      
      for (const product of sampleProducts) {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        productsCreated++;
      }
      
      console.log(`Created ${productsCreated} sample products`);
    } else {
      console.log('Products collection already has data, skipping initialization');
    }

    // Check vouches collection
    const vouchesSnapshot = await getDocs(collection(db, 'vouches'));
    
    if (!skipIfExists || vouchesSnapshot.empty) {
      console.log('Initializing vouches collection...');
      
      for (const vouch of sampleVouches) {
        await addDoc(collection(db, 'vouches'), {
          ...vouch,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        vouchesCreated++;
      }
      
      console.log(`Created ${vouchesCreated} sample vouches`);
    } else {
      console.log('Vouches collection already has data, skipping initialization');
    }

    return { productsCreated, vouchesCreated };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Check database status
 */
export const checkDatabaseStatus = async () => {
  try {
    const [products, vouches] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'vouches'))
    ]);
    
    return {
      products: products.size,
      vouches: vouches.size
    };
  } catch (error) {
    console.error('Error checking database status:', error);
    return {
      products: 0,
      vouches: 0
    };
  }
};

/**
 * Make a user an admin by email
 */
export const makeUserAdmin = async (email: string): Promise<boolean> => {
  try {
    // Query users by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      console.error('No user found with email:', email);
      return false;
    }
    
    // Update the user's role to admin
    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'admin',
      updatedAt: Timestamp.now()
    });
    
    console.log('User successfully made admin:', email);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
};

/**
 * Initialize database with temporary admin bypass
 * This should only be used for initial setup
 */
export const initializeDatabaseWithSetup = async (): Promise<{
  productsCreated: number;
  vouchesCreated: number;
}> => {
  let productsCreated = 0;
  let vouchesCreated = 0;

  try {
    console.log('Starting database initialization...');
    
    // Initialize products
    for (const product of sampleProducts) {
      try {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        productsCreated++;
        console.log(`Created product: ${product.name}`);
      } catch (error) {
        console.error(`Failed to create product ${product.name}:`, error);
      }
    }
    
    // Initialize vouches
    for (const vouch of sampleVouches) {
      try {
        await addDoc(collection(db, 'vouches'), {
          ...vouch,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        vouchesCreated++;
        console.log(`Created vouch from: ${vouch.name}`);
      } catch (error) {
        console.error(`Failed to create vouch from ${vouch.name}:`, error);
      }
    }

    console.log(`Initialization complete: ${productsCreated} products, ${vouchesCreated} vouches`);
    return { productsCreated, vouchesCreated };
  } catch (error) {
    console.error('Error during initialization:', error);
    throw error;
  }
}; 