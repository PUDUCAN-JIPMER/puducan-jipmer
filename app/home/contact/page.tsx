�ǜ�'��)���n��jן���y�-�jh�۬xZ+��蚷�r�h�G�h����·Qz�%��߮���������(������v)���s~�&·\�{-r��i�E���r�k:��-~�e5����k�x&�}�jg���[y�ey�-��Z��-z������k�x���>W��秵�ڽ�bu隊V�v���˛��-��k�x&�~R���rٮ���j�^j�yr�i�^�ɞ�Ơ{;-�)��)��Ǭ����-m歕欷]���r׫�ܩx*'��-��
�Z�)�z�r��r��i�E���r�i�i��]y������b�p��֜���y�'�جJ���b�������ا��J֭y����(��kz����jwey+��+kzǭ~��J֭y�뢻

import { db } from '@/firebase/config';
  const onSubmit = async (data: FormData) => {
    try {
      await addDoc(collection(db, 'contactMessages'), data);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    }
  };
