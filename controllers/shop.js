const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  // .find() does not give curser like mongo driver does, but gives us all the products
  // if querying with large amounts of data, should turn to curser or limit set of data that is retrieved
  Product.find()
    .then(products => {
      console.log(products)
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // mongoose .findById() method
  // can pass in string here, and mongoose will automatically turn it into a mongo objectID
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    // get array of productId objects
    .populate('cart.items.productId')
    //.populate does not return a promise so need this extra function to get the promise
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    // get array of productId objects
    .populate('cart.items.productId')
    //.populate does not return a promise so need this extra function to get the promise
    .execPopulate()
    .then(user => {
      // get products in user's cart
      const products = user.cart.items.map(i =>{
        // productId is object with metadata - ._doc gets access to just data, then spread operator will get all data in document
        // store all product data with every order
        return {quantity: i.quantity, product: {...i.productId._doc}}
      });
      const order = new Order({
        user: {
          name: req.user.name,
          // entire user object but mongoose will extract the userId from there
          userId: req.user
        },
        products: products
      });
      //save order to database
      order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() =>{
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  // userId is nested under user defined in Order model
  // get all orders that belong to this user
  Order.find({'user.userId': req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};
