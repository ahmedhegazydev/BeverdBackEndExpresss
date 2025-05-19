const swaggerJsdoc = require('swagger-jsdoc');

// Define the Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0', // Specify OpenAPI version
        info: {
            title: 'E-Commerce API Documentation', //  API title
            version: '1.0.0', // API version
            description: 'Documentation for E-Commerce API', // API description
        },
        servers: [
            {
                url: 'http://localhost:3000', //  base URL of your API.
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        // Schemas
        schemas: {
            User: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    phone: { type: 'string' },
                    gender: { type: 'string', enum: ['male', 'female'] },
                    birthDate: { type: 'string', format: 'date' },
                    isVerified: { type: 'boolean' },
                    confirmationToken: { type: 'string' },
                    resetPasswordToken: { type: 'string' },
                    resetPasswordExpires: { type: 'string', format: 'date-time' },
                    addresses: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                label: { type: 'string' },
                                city: { type: 'string' },
                                street: { type: 'string' },
                                zip: { type: 'string' },
                                location: {
                                    type: 'object',
                                    properties: {
                                        lat: { type: 'number' },
                                        lng: { type: 'number' },
                                    },
                                },
                            },
                        },
                    },
                    favorites: {
                        type: 'array',
                        items: { type: 'string' }, // Assuming these are product variant IDs
                    },
                    orders: {
                        type: 'array',
                        items: { type: 'string' }, // Assuming these are order IDs
                    },
                },
            },
            ProductVariant: {
                type: 'object',
                properties: {
                    productId: { type: 'string' }, //  ObjectId,
                    size: { type: 'string' },
                    color: { type: 'string' },
                    price: { type: 'number' },
                    stock: { type: 'number' },
                    images: { type: 'array', items: { type: 'string' } },
                },
            },
            Product: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    brand: { type: 'string' },
                    basePrice: { type: 'number' },
                    category: { type: 'string' }, // ObjectId,
                    isFeatured: { type: 'boolean' },
                    variants: {
                        type: 'array',
                        items: { type: 'string' }, //  ProductVariant IDs
                    },
                },
            },
            Category: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    image: { type: 'string' }, // URL
                },
            },
            Order: {
                type: 'object',
                properties: {
                    userId: { type: 'string' }, // ObjectId,
                    productVariant: { type: 'string' }, //  ObjectId,
                    quantity: { type: 'number' },
                    totalPrice: { type: 'number' },
                    status: {
                        type: 'string',
                        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                    },
                },
            },
            Cart: {
                type: 'object',
                properties: {
                    userId: { type: 'string' }, // ObjectId
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                productId: { type: 'string' }, // ObjectId
                                quantity: { type: 'number' },
                            },
                        },
                    },
                },
            },
            Admin: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
            },
            Return: {
                type: 'object',
                properties: {
                    userId: { type: 'string' }, // ObjectId,
                    orderId: { type: 'string' }, // ObjectId,
                    product: {
                        type: 'object',
                        properties: {
                            variantId: { type: 'string' }, // ObjectId
                            quantity: { type: 'number' },
                        },
                    },
                    reason: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                },
            },
            Review: {
                type: 'object',
                properties: {
                    userId: { type: 'string' }, // ObjectId,
                    productId: { type: 'string' }, // ObjectId,
                    rating: { type: 'number', minimum: 1, maximum: 5 },
                    comment: { type: 'string' },
                },
            },
        },
    },
    // Specify the files to scan for API annotations
    apis: [
        './routes/auth.js',
        './routes/category.js',
        './routes/users.js',
        './routes/products.js',
        './routes/order.js',
        './routes/cart.js',
        './routes/admins.js',
        './routes/returns.js',
        './routes/reviews.js',
    ], //  path to your route files
};

// Generate the Swagger specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
