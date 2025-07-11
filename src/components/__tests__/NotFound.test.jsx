import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock the CSS import
jest.mock('../../styles/notfound.css', () => ({}));

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('NotFound Component', () => {
    test('renders 404 page with correct content', () => {
        renderWithRouter(<NotFound />);
        
        // Check if the main heading is present
        expect(screen.getByText("Look like you're lost")).toBeInTheDocument();
        
        // Check if the description is present
        expect(screen.getByText("...maybe the page you're looking for is not found or never existed.")).toBeInTheDocument();
        
        // Check if the "Go to Home" link is present
        expect(screen.getByText("Go to Home")).toBeInTheDocument();
        
        // Check if the link has correct href
        const homeLink = screen.getByText("Go to Home");
        expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });

    test('has correct CSS classes applied', () => {
        renderWithRouter(<NotFound />);
        
        // Check if the main section has the correct class
        const section = document.querySelector('.page_404');
        expect(section).toBeInTheDocument();
        
        // Check if the 404 background div is present
        const backgroundDiv = document.querySelector('.four_zero_four_bg');
        expect(backgroundDiv).toBeInTheDocument();
        
        // Check if the content box is present
        const contentBox = document.querySelector('.contant_box_404');
        expect(contentBox).toBeInTheDocument();
    });
}); 