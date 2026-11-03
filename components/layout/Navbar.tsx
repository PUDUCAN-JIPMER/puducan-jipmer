�ǜ�'��)���n��.��oܢ{^��?�a
��{b��+��
��s���inr'^�朶)���K�y���{�)�jh�۬x���v�y��w���ھ(�*'�jh�۬y+Z���j�i�b��+��y: �W�����/��%z)���R�	κ�n��'~�&�(����m�x����J�-j)�n)b�$������֢���+rN*\�{-I0I�&��)ݡ�h�{��籦��u�ں[_�w-���j�ڭ�'����x���'��Z�ڙ�x���v�y�'�ٞ��z{�ǧ��^��J֭y����(��\jub{�j�

import { useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';

const Navbar: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const isMobileScreen = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    setIsMobile(isMobileScreen);
  }, [isMobileScreen]);

  return (
    <nav style={{ display: isMobile ? 'flex' : 'block' }}>
      {/* Navbar content */}
    </nav>
  );
};

export default Navbar;

import { useState, useEffect } from 'react';
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    {isMobile && <MobileNavbar />}
const MobileNavbar = () => {
    return <div>Mobile Navbar</div>;
};
