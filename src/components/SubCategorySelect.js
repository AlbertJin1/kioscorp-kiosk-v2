import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IoMdArrowBack, IoMdArrowForward, IoMdCart, IoMdRemoveCircleOutline, IoMdAddCircleOutline } from 'react-icons/io';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoImage from '../img/Logo/kioscorp.png';
import BackgroundImage from '../img/Background/background.png';
import axios from 'axios';


const SubCategorySelect = ({ token, user, mainCategories, cart, setCart }) => {
    const location = useLocation();
    const { mainCategory } = location.state || {};
    const navigate = useNavigate();
    const [subCategories, setSubCategories] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const fetchSubCategories = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/sub-categories/?main_category=${mainCategory}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            const data = await response.json();
            setSubCategories(data.filter(subCategory => subCategory.main_category === mainCategory));
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    }, [token, mainCategory]);

    useEffect(() => {
        fetchSubCategories();
    }, [fetchSubCategories]);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const sortedSubCategories = useMemo(() => {
        return subCategories.sort((a, b) => a.sub_category_name.localeCompare(b.sub_category_name));
    }, [subCategories]);

    const filteredSubCategories = sortedSubCategories.filter(subCategory =>
        subCategory.sub_category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredSubCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSubCategories = filteredSubCategories.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Add these functions for cart functionality
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

    const handleSubCategoryClick = (subCategory) => {
        Swal.fire({
            title: `You selected ${subCategory.sub_category_name}`,
            icon: 'info',
            showConfirmButton: false,
            timer: 1500,
        });
        navigate('/products', { state: { subCategory: subCategory.sub_category_id } });
    };

    const getMainCategoryName = (id) => {
        if (!mainCategories.length) {
            return 'Loading...';
        }

        const mainCategory = mainCategories.find(category => category.main_category_id === id);
        return mainCategory ? mainCategory.main_category_name : 'Unknown';
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
                            <span className="text-[#FFBD59]">W</span>hat
                            <span className="text-[#FFBD59]"> P</span>roducts
                            <span className="text-[#FFBD59]"> D</span>o
                            <span className="text-[#FFBD59]"> Y</span>ou
                            <span className="text-[#FFBD59]"> N</span>eed?
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

                <div className="flex flex-col items-center flex-1 mb-4">
                    <h2 className="text-5xl font-bold mb-6 text-white">
                        {getMainCategoryName(mainCategory)} Subcategories
                    </h2>
                    {currentSubCategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1">
                            <p className="text-6xl text-red-500 text-center font-bold">
                                No subcategories found for {getMainCategoryName(mainCategory)}.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 flex-1 overflow-y-auto">
                            {currentSubCategories.map(subCategory => (
                                <div
                                    key={subCategory.sub_category_id}
                                    className="flex flex-col items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-lg transition duration-300 cursor-pointer"
                                    onClick={() => handleSubCategoryClick(subCategory)}
                                >
                                    <div className="flex-1 flex justify-center items-center">
                                        <img
                                            src={subCategory.sub_category_image
                                                ? `http://localhost:8000${subCategory.sub_category_image}`
                                                : "https://via.placeholder.com/150"
                                            }
                                            alt={subCategory.sub_category_name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null; // prevents looping
                                                e.target.src = "https://via.placeholder.com/150";
                                            }}
                                        />
                                    </div>
                                    <span className="text-3xl font-bold text-center mt-2">{subCategory.sub_category_name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center py-4">
                    <button
                        disabled={currentPage === 1 || totalPages === 0}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className={`flex justify-between items-center p-4 rounded shadow-md transition duration-300 w-56 h-20 ${currentPage === 1 || totalPages === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                        <IoMdArrowBack className="text-4xl" />
                        <span className="text-4xl font-bold">Previous</span>
                    </button>
                    <span className="text-center text-3xl font-bold text-white">{`Page ${currentPage} of ${totalPages === 0 ? 0 : totalPages}`}</span>
                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className={`flex justify-between items-center p-4 rounded shadow-md transition duration-300 w-56 h-20 ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                        <span className="text-4xl font-bold">Next</span>
                        <IoMdArrowForward className="text-4xl" />
                    </button>
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
    );
};

export default SubCategorySelect;