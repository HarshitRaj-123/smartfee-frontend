import { Outlet } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import Navbar from "../utils/Navbar/Navbar";
import Footer from "../utils/Footer/Footer";

const LandingLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default LandingLayout;