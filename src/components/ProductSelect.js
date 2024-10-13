import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IoMdArrowBack, IoMdArrowForward, IoMdCart, IoMdRemoveCircleOutline, IoMdAddCircleOutline } from 'react-icons/io';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import LogoImage from '../img/Logo/kioscorp.png';
import BackgroundImage from '../img/Background/background.png';

const ProductSelect = ({ token, user, cart, setCart }) => {
    const location = useLocation();
    const { subCategory } = location.state || {};
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const fetchProducts = useCallback(async () => {
        if (!subCategory) return;
        try {
            const response = await fetch(`http://localhost:8000/api/products/?sub_category=${subCategory}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [token, subCategory]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const sortedProducts = useMemo(() => {
        return products.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }, [products]);

    const filteredProducts = sortedProducts.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleProductClick = (product) => {
        if (selectedProduct && selectedProduct.product_id === product.product_id) {
            // If the clicked product is already selected, unselect it
            setSelectedProduct(null);
        } else {
            // Otherwise, select the clicked product
            setSelectedProduct(product);
        }
    };

    const handleAddToCart = () => {
        if (selectedProduct) {
            setCart(prevCart => {
                const existingItem = prevCart.find(item => item.product_id === selectedProduct.product_id);
                if (existingItem) {
                    return prevCart.map(item =>
                        item.product_id === selectedProduct.product_id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    return [...prevCart, { ...selectedProduct, quantity: 1 }];
                }
            });
            Swal.fire({
                position: 'top-end ',
                icon: 'success',
                title: `${selectedProduct.product_name} added to cart`,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        setCart(prevCart => prevCart.map(item =>
            item.product_id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
        ));
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.product_price * item.quantity, 0);
    };

    const handlePrint = async () => {
        if (cart.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please add items to your cart before printing.'
            });
            return;
        }

        const printData = {
            items: cart.map(item => ({
                name: item.product_name,
                quantity: item.quantity,
                price: item.product_price
            })),
            total: calculateTotal()
        };

        try {
            const response = await axios.post('http://localhost:8000/api/print-receipt/', printData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Your receipt has been printed successfully.',
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    willClose: () => {
                        navigate('/feedback');
                    }
                });
                setCart([]);  // Clear the cart after successful print
                setIsCartOpen(false);  // Close the cart modal
            } else {
                throw new Error(response.data.message || 'Printing failed');
            }
        } catch (error) {
            console.error('Error printing receipt:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error printing the receipt. Please try again.'
            });
        }
    };

    return (
        <div className="h-screen m-w-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <div className="flex flex-col h-full p-6">
                <header className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <IoMdArrowBack
                            className="text-4xl mr-12 bg-blue-500 text-7xl p-2 rounded-lg text-[#FFBD59] shadow-md cursor-pointer"
                            onClick={() => navigate(-1)}
                        />
                        <img
                            src={LogoImage}
                            alt="Logo"
                            className="h-24 object-cover"
                        />
                    </div>
                    <div className="flex-1 text-center">
                        <h1 className="text-6xl font-bold text-white">
                            <span className="text-[#FFBD59]">S</span>elect
                            <span className="text-[#FFBD59]"> Y</span>our
                            <span className="text-[#FFBD59]"> P</span>roduct
                        </h1>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="border-2 rounded-lg border-black px-4 h-16 text-3xl font-semibold mr-4"
                        />
                        <IoMdCart
                            className="text-6xl text-[#FFBD59] cursor-pointer"
                            onClick={() => setIsCartOpen(true)}
                        />
                    </div>
                </header>

                <div className="flex flex-1">
                    <div className="w-2/3 pr-4 flex flex-col bg-blue-800 bg-opacity-50 p-4 rounded-lg">
                        <h2 className="text-5xl font-bold mb-2 text-white">
                            Products
                        </h2>
                        {currentProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1">
                                <p className="text-6xl text-red-500 text-center font-bold">
                                    No products found.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-4 gap-6 flex-1 overflow-y-auto mb-4">
                                    {currentProducts.map((product, index) => (
                                        <div
                                            key={product.product_id}
                                            className={`flex flex-col items-center justify-center p-4 border border-gray-300 rounded-md shadow-lg hover:shadow-xl transition duration-300 cursor-pointer ${selectedProduct?.product_id === product.product_id
                                                ? 'bg-[#FFBD59] text-white'
                                                : 'bg-white'
                                                }`}
                                            onClick={() => handleProductClick(product)}
                                        >
                                            <div className="flex-1 flex justify-center items-center">
                                                <img
                                                    src={product.product_image
                                                        ? `http://localhost:8000${product.product_image}`
                                                        : "https://via.placeholder.com/150"
                                                    }
                                                    alt={product.product_name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/150";
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xl font-bold text-center mt-2">{product.product_name}</span>
                                            <span className="text-lg font-semibold text-center mt-1">₱{product.product_price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        className={`flex justify-between items-center p-4 rounded shadow-md transition duration-300 w-56 h-20 ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                    >
                                        <IoMdArrowBack className="text-4xl" />
                                        <span className="text-4xl font-bold">Previous</span>
                                    </button>
                                    <span className="text-center text-3xl font-bold text-white">{`Page ${currentPage} of ${totalPages}`}</span>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        className={`flex justify-between items-center p-4 rounded shadow-md transition duration-300 w-56 h-20 ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                    >
                                        <span className="text-4xl font-bold">Next</span>
                                        <IoMdArrowForward className="text-4xl" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="w-1/3 pl-4 flex flex-col h-full">
                        <h2 className="text-5xl font-bold bg-white px-6 pt-4 rounded-tr-lg rounded-tl-lg bg-opacity-75">
                            Product Details
                        </h2>
                        {selectedProduct ? (
                            <div className="bg-white p-6 rounded-br-lg rounded-bl-lg shadow-lg flex flex-col flex-grow bg-opacity-75">
                                <input
                                    className="text-3xl font-bold mb-4 border-2 border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                                    value={selectedProduct.product_name}
                                    readOnly
                                />
                                <div className="flex-grow overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {[
                                            { label: 'Price', value: `₱${selectedProduct.product_price}` },
                                            { label: 'Type', value: selectedProduct.product_type },
                                            { label: 'Size', value: selectedProduct.product_size },
                                            { label: 'Color', value: selectedProduct.product_color },
                                            { label: 'Brand', value: selectedProduct.product_brand },
                                            {
                                                label: 'Status',
                                                value: selectedProduct.product_quantity > 0 ? 'In Stock' : 'Out of Stock',
                                                className: selectedProduct.product_quantity > 0
                                                    ? 'border-green-500 text-green-500'
                                                    : 'border-red-500 text-red-500'
                                            },
                                        ].map((field, index) => (
                                            <div key={index}>
                                                <label className="text-xl font-bold block mb-1">{field.label}:</label>
                                                <input
                                                    className={`text-xl w-full border-2 border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 ${field.className || ''}`}
                                                    value={field.value}
                                                    readOnly
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-xl font-bold block mb-1">Description:</label>
                                        <textarea
                                            className="text-xl w-full border-2 border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 resize-none"
                                            value={selectedProduct.product_description}
                                            readOnly
                                            rows={5}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={() => handleAddToCart()}
                                        className="bg-[#FFBD59] text-white px-6 py-3 rounded-lg text-xl font-semibold hover:bg-[#FFA500] transition duration-300"
                                        disabled={selectedProduct.product_quantity === 0}
                                    >
                                        Add To Cart
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-br-lg rounded-bl-lg shadow-lg flex items-center justify-center flex-grow bg-opacity-75">
                                <p className="text-2xl text-gray-500">Select a product to view details</p>
                            </div>
                        )}
                    </div>

                    {/* CART MODAL */}
                    {isCartOpen && (
                        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-3/4 flex flex-col">
                                <h2 className="text-5xl font-bold mb-4">Shopping Cart</h2>
                                <hr className="border-gray-300 mb-4" />
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center flex-grow">
                                        <p className="text-2xl text-gray-500 mb-4">Your cart is empty.</p>
                                        <button
                                            onClick={() => setIsCartOpen(false)}
                                            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg text-3xl font-bold hover:bg-gray-400 transition duration-300"
                                        >
                                            CLOSE
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between mb-4 text-4xl font-bold text-gray-600">
                                            <span className="w-1/6 text-center">Image</span>
                                            <span className="w-1/3">Product Name</span>
                                            <span className="w-1/4 text-center">Quantity</span>
                                            <span className="w-1/4 text-center">Price</span>
                                            <span className="w-1/6 text-center">Action</span>
                                        </div>
                                        <hr className="border-gray-300 mb-4" />
                                        <div className="flex flex-col flex-grow overflow-y-auto">
                                            {cart.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center mb-4">
                                                    <div className="w-1/6 flex justify-center">
                                                        <img
                                                            src={item.product_image
                                                                ? `http://localhost:8000${item.product_image}`
                                                                : "https://via.placeholder.com/150"
                                                            }
                                                            alt={item.product_name}
                                                            className="h-20 w-20 object-cover rounded"
                                                            onError={(e) => {
                                                                e.target.onerror = null; // prevents looping
                                                                e.target.src = "https://via.placeholder.com/150";
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-3xl font-bold w-1/3">{item.product_name}</span>
                                                    <div className="flex items-center justify-center w-1/4">
                                                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}>
                                                            <IoMdRemoveCircleOutline className="text-5xl text-blue-500 hover:text-blue-700" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleUpdateQuantity(item.product_id, parseInt(e.target.value))}
                                                            className="w-16 font-bold text-2xl text-center border-2 border-gray-300 rounded p-2 mx-2 focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}>
                                                            <IoMdAddCircleOutline className="text-5xl text-blue-500 hover:text-blue-700" />
                                                        </button>
                                                    </div>
                                                    <span className="text-3xl font-bold w-1/4 text-center">₱{item.product_price}</span>
                                                    <button
                                                        onClick={() => handleRemoveFromCart(item.product_id)}
                                                        className="text-red-500 hover:text-red-700 w-1/6 flex justify-center text-3xl font-bold"
                                                    >
                                                        REMOVE
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <hr className="border-gray-300 mb-4" />
                                        {/* Footer with Close, Total, and Print */}
                                        <div className="flex justify-between items-center mt-4">
                                            <button
                                                onClick={() => setIsCartOpen(false)}
                                                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg text-3xl font-bold hover:bg-gray-400 transition duration-300"
                                            >
                                                CLOSE
                                            </button>
                                            <div className="flex justify-center items-center">
                                                <span className="text-4xl font-bold mr-4">Total:</span>
                                                <span className="text-6xl font-bold">₱{calculateTotal()}</span>
                                            </div>
                                            <button
                                                onClick={handlePrint}
                                                className="bg-blue-500 text-white px-6 py-3 rounded-lg text-3xl font-bold hover:bg-blue-600 transition duration-300"
                                            >
                                                PRINT
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProductSelect;