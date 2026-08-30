/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

describe('UI Components', () => {
  it('renders the Button component with children', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByText(/Click Me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies the correct variant class to the Button component', () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByText(/Delete/i);
    expect(buttonElement).toHaveClass('bg-destructive');
  });

  it('renders the Badge component correctly', () => {
    render(<Badge>New Feature</Badge>);
    const badgeElement = screen.getByText(/New Feature/i);
    expect(badgeElement).toBeInTheDocument();
  });
});

