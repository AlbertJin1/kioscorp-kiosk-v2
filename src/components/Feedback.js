import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import LogoImage from '../img/Logo/kioscorp.png';
import BackgroundImage from '../img/Background/background.png';

const Feedback = () => {
    const navigate = useNavigate();
    const [rating, setRating] = useState(0); // Set the rating to 0 by default

    const handleSubmit = (rating) => {
        // Send the rating to the server
        axios.post('http://localhost:8000/api/feedback/', { rating })
            .then((response) => {
                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thank you!',
                        text: 'Your feedback has been submitted successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        Swal.close();
                        setRating(0); // Reset the rating to 0
                        navigate('/');
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'There was an error submitting your feedback. Please try again.',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        Swal.close();
                        setRating(0); // Reset the rating to 0
                    });
                }
            })
            .catch((error) => {
                console.error('Error submitting feedback:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'There was an error submitting your feedback. Please try again.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    Swal.close();
                    setRating(0); // Reset the rating to 0
                });
            });
    };

    const handleRatingChange = (rating) => {
        setRating(rating);
        handleSubmit(rating);
    };

    return (
        <div className="h-screen bg-cover bg-center" style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <div className="container mx-auto p-4 pt-6 flex flex-col justify-between items-center h-screen">
                <div className="flex flex-col items-center mb-4">
                    <img
                        src={LogoImage}
                        alt="Logo"
                        className="h-24 object-cover mb-2" // Add margin-bottom for spacing
                    />
                    <h2 className="text-7xl font-bold text-white mb-6"><span className='text-[#FFBD59]'>U</span>niversal <span className='text-[#FFBD59]'>A</span>uto <span className='text-[#FFBD59]'>S</span>upply and <span className='text-[#FFBD59]'>B</span>olts</h2>
                </div>
                <div className="text-center">
                    <h2 className="font-bold text-white mb-4" style={{ fontSize: 150, fontFamily: 'Georgia, serif' }}>Thank You</h2>
                    <hr className="border-white border-4 mb-4" />
                    <h2 className="font-bold text-white mb-4" style={{ fontSize: 50, fontFamily: 'Georgia, serif' }}>Proceed<span className='text-[#FFBD59]'> to the </span>Cashier</h2>
                    <h2 className="font-bold text-white mb-4" style={{ fontSize: 50 }}><span className='text-[#FFBD59]'>K</span>amusta <span className='text-[#FFBD59]'>I</span>mohang <span className='text-[#FFBD59]'>P</span>ag <span className='text-[#FFBD59]'>G</span>amit?</h2>
                    <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => handleRatingChange(star)} className={`mx-2 ${rating >= star ? 'text-yellow-500' : 'text-gray-500'}`}>
                                <FontAwesomeIcon icon={faStar} style={{ fontSize: 300 }} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-auto"></div>
            </div>
        </div>
    );
};

export default Feedback;