import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../img/Logo/kioscorp.png';
import AutoSupplyImage from '../img/Categories/auto.png';
import BoltsImage from '../img/Categories/bolts.png';
import BackgroundImage from '../img/Background/background.png';

const MainCategorySelect = ({ token, user, cart, setCart }) => {
    const navigate = useNavigate();
    const [mainCategories, setMainCategories] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/main-categories/', {
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => setMainCategories(data));
    }, [token]);

    const handleCategoryClick = (category) => {
        Swal.fire({
            title: `Navigating to ${category.main_category_name}`,
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            width: '50rem',
            padding: '2rem',
            backdrop: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
        });

        setTimeout(() => {
            navigate('/sub-category', { state: { mainCategory: category.main_category_id } });
        }, 2000);
    };

    return (
        <div
            className="flex flex-col items-center h-screen bg-gray-100"
            style={{
                backgroundImage: `url(${BackgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <header className="flex flex-col justify-center items-center mb-8">
                <img
                    src={LogoImage}
                    alt="Logo"
                    className="w-auto h-32 object-cover mt-6 mb-4"
                />
                <h1 className="text-7xl font-bold">
                    <span className="text-[#FFBD59]">Universal Auto Supply</span>
                    <span className="text-white"> and</span>
                    <span className="text-[#FFBD59]"> Bolt Center</span>
                </h1>
            </header>
            <div className="flex flex-grow items-center justify-center flex-col">
                <div className="mb-8">
                    <h2 className="text-6xl font-bold mb-8 text-white">Select a Category</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-64">
                    {mainCategories.map(category => (
                        <button
                            key={category.main_category_id}
                            className="flex flex-col items-center p-8 bg-white border-4 border-black text-black rounded-lg shadow-lg hover:bg-blue-600 hover:text-white transition duration-300"
                            onClick={() => handleCategoryClick(category)}
                        >
                            <img src={category.main_category_name === 'Auto Supply' ? AutoSupplyImage : BoltsImage} alt="Auto Supply" className="w-auto h-96 mb-2" />
                            <span className="text-6xl font-bold mt-4">{category.main_category_name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainCategorySelect;