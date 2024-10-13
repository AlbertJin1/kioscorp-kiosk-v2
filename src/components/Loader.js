import React from 'react';
import { FadeLoader } from 'react-spinners'; // Import the FadeLoader from react-spinners

const Loader = () => {
    return (
        <div className="flex flex-col justify-center items-center h-full">
            <FadeLoader
                height={20}
                width={5}
                radius={2}
                margin={2}
                color="#00BFFF"
                loading={true}
            />
            <p className="mt-4 text-2xl font-semibold">
                Please wait, loading data...
            </p>
        </div>
    );
};

export default Loader;
