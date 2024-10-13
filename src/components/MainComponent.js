import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainCategorySelect from './MainCategorySelect';
import SubCategorySelect from './SubCategorySelect';
import ProductSelect from './ProductSelect';
import Feedback from './Feedback';
import Loader from './Loader';
import './CustomSweetAlert.css';

const MainComponent = () => {
    const [token, setToken] = useState('');
    const [user, setUser] = useState({});
    const [mainCategories, setMainCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const loginAndFetchData = async () => {
            try {
                // Login as the default owner user
                const loginResponse = await fetch('http://localhost:8000/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'owner',
                        password: 'password',
                    }),
                });

                if (!loginResponse.ok) {
                    throw new Error('Login failed');
                }

                const loginData = await loginResponse.json();
                setToken(loginData.token);
                setUser(loginData);
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('user', JSON.stringify(loginData));

                // Fetch main categories
                const categoriesResponse = await fetch('http://localhost:8000/api/main-categories/', {
                    headers: {
                        'Authorization': `Token ${loginData.token}`,
                    },
                });

                if (!categoriesResponse.ok) {
                    throw new Error('Failed to fetch main categories');
                }

                const categoriesData = await categoriesResponse.json();
                setMainCategories(categoriesData);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loginAndFetchData();
    }, []);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw'
            }}>
                <Loader />
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainCategorySelect token={token} user={user} mainCategories={mainCategories} cart={cart} setCart={setCart} />} />
                <Route path="/sub-category" element={<SubCategorySelect token={token} user={user} mainCategories={mainCategories} cart={cart} setCart={setCart} />} />
                <Route path="/products" element={<ProductSelect token={token} user={user} cart={cart} setCart={setCart} />} />
                <Route path="/feedback" element={<Feedback />} />
            </Routes>
        </Router>
    );
};

export default MainComponent;