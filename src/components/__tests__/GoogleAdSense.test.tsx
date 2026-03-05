import { render } from '@testing-library/react';
import GoogleAdSense from '../GoogleAdSense';

// next/script mock
jest.mock('next/script', () => {
    return function MockScript({ src, async, crossOrigin, strategy }: any) {
        return (
            <div
                data-testid="google-adsense-mock"
                data-src={src}
                data-async={async}
                data-crossorigin={crossOrigin}
                data-strategy={strategy}
            />
        );
    };
});

describe('GoogleAdSense Component', () => {
    it('renders the AdSense script mock with correct attributes', () => {
        const { getByTestId } = render(<GoogleAdSense />);
        const scriptMock = getByTestId('google-adsense-mock');

        expect(scriptMock).toHaveAttribute(
            'data-src',
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9702335674400881'
        );
        expect(scriptMock).toHaveAttribute('data-async', 'true');
        expect(scriptMock).toHaveAttribute('data-crossorigin', 'anonymous');
        expect(scriptMock).toHaveAttribute('data-strategy', 'afterInteractive');
    });
});
