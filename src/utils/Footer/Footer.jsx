import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedIcon from '@mui/icons-material/Verified'; // ISO badge alternative

const Footer = () => {
  return (
    <Box component="footer">
      {/* Main Footer Section */}
      <div className="bg-gray-900 text-white mx-2 py-16 px-6 md:px-12 rounded-t-3xl">
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">school</span>
                        </div>
                        <span className="text-2xl font-bold">SmartFee</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        Transforming educational finance management through automation, transparency, and intelligent
                        controls.
                    </p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Product</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Features
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Pricing
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Demo
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Integration
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Documentation
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Help Center
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Contact
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Training
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Company</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                About
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Careers
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Privacy
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Terms
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
                <p className="text-gray-400 text-sm">© 2024 SmartFee. All rights reserved.</p>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <a
                        href="#"
                        className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                        <i className="fa-brands fa-twitter text-sm"></i>
                    </a>
                    <a
                        href="#"
                        className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                        <i className="fa-brands fa-linkedin text-sm"></i>
                    </a>
                    <a
                        href="#"
                        className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                        <i className="fa-brands fa-github text-sm"></i>
                    </a>
                </div>
            </div>
        </div>
        {/* Next: "Add pricing section with tiered plans and feature comparison table" */}
    </div>
    </Box>
  );
};

export default Footer;
