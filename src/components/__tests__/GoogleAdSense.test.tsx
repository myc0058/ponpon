import { render } from '@testing-library/react';
import GoogleAdSense from '../GoogleAdSense';

describe('GoogleAdSense Component', () => {
    it('renders the AdSense script with correct attributes as a native tag', () => {
        // Native script tags are sometimes filtered out by testing-library render if not careful,
        // but let's see. 
        const { container } = render(<GoogleAdSense />);
        const script = container.querySelector('script');

        expect(script).toBeInTheDocument();
        expect(script).toHaveAttribute(
            'src',
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9702335674400881'
        );
        expect(script).toHaveAttribute('async');
        expect(script).toHaveAttribute('crossorigin', 'anonymous');
    });
});
