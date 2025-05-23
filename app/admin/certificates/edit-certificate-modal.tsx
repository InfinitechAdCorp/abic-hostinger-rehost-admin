import { Button, Modal, ModalBody, ModalContent, ModalHeader, Textarea } from "@heroui/react";
import { Formik, Form, } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

import CustomInput from '@/components/input';
import type { Certificate } from '@/app/utils/types';
import toast from 'react-hot-toast';
import { useState } from "react";

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    date: Yup.string().required('Date is required'),
});


interface EditCertificateModalProps {
    certificate: Certificate | null;
    isOpen: boolean;
    onClose: () => void;
    mutate: () => void;
}

const EditCertificateModal: React.FC<EditCertificateModalProps> = ({ certificate, isOpen, onClose, mutate }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(`https://abicmanpowerservicecorp.com/certificates/${certificate?.image}` || null);
    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        console.log(values);

        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/certificates`, values, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }

            });
            toast.success('Operation successful!');
            onClose();
            console.log('data added:', response.data);
            mutate();
        } catch (error: any) {
            toast.error('Something went wrong.');
            setSubmitting(false);
            console.error('Error adding user:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
            <ModalContent>
                <ModalHeader>
                    <h1>Edit {certificate?.name}</h1>
                </ModalHeader>
                <ModalBody className="pb-6">
                    <Formik
                        initialValues={{
                            _method: 'PUT',
                            id: certificate?.id,
                            user_id: certificate?.user_id,
                            name: certificate?.name,
                            date: certificate?.date,
                            image: certificate?.image,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ errors, touched, setFieldValue, isSubmitting }) => (
                            <Form className="space-y-4">
                                <CustomInput
                                    name="name"
                                    label="Name"
                                    type="text"
                                    error={touched.name ? errors.name : undefined}
                                />
                                <CustomInput
                                    name="date"
                                    label="Date"
                                    type="date"
                                    error={touched.date ? errors.date : undefined}
                                />
                                <CustomInput
                                    name="image"
                                    label="Image"
                                    type="file"
                                    error={touched.image ? errors.image : undefined}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = event.target.files?.[0];
                                        setFieldValue('image', file);
                                        if (file) {
                                            const imageUrl = URL.createObjectURL(file);
                                            setImagePreview(imageUrl);
                                        }
                                    }}
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <p className="text-gray-600 text-sm">Image Preview:</p>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="mt-1 w-full h-32 object-cover justify-center rounded-lg border"
                                        />
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    color="primary"
                                    className="w-full"
                                    isDisabled={isSubmitting}
                                    isLoading={isSubmitting}
                                >
                                    Save Changes
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default EditCertificateModal;
