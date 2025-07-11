import { Suspense } from "react";
import CustomLoader from "./CustomLoader";

// Simple loader with fallback options
const Loader = (Component, fallbackType = 'default') => (props) => {
    let fallback;
    
    switch (fallbackType) {
        case 'page':
            fallback = (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            );
            break;
        case 'component':
            fallback = (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            );
            break;
        case 'modal':
            fallback = (
                <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
            );
            break;
        default:
            fallback = <CustomLoader />;
    }
    
    return (
        <Suspense fallback={fallback}>
            <Component {...props} />
        </Suspense>
    );
};

// Backward compatibility
const index = Loader;

export default index;
export { Loader };