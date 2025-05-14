import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomInput from '@/components/input';
import type { Partner } from '@/app/utils/types';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
});

interface EditPartnerModalProps {
    partner: Partner | null;
    isOpen: boolean;
    onClose: () => void;
    mutate: () => void;
}

const EditPartnerModal: React.FC<EditPartnerModalProps> = ({ partner, isOpen, onClose, mutate }) => {

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        console.log(values);
    
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/partners`, values, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
    
            // Close the modal after successful submission
            onClose();
            
            // Log the response data
            console.log('Data added:', response.data);
    
            // Call mutate to refetch the data if needed
            mutate();
    
            // Show success toast
            toast.success('Operation successful!');
        } catch (error: any) {
            // Set submitting to false when there's an error
            setSubmitting(false);
    
            // Log the error for debugging purposes
            console.error('Error adding partner:', error);
    
            // Show error toast
            toast.error('Error adding partner. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
            <ModalContent>
                <ModalHeader>
                    <h1>Edit {partner?.name}</h1>
                </ModalHeader>
                <ModalBody className="pb-6">
                    <Formik
                        initialValues={{
                            id: partner?.id,
                            name: partner?.name,
                            image: partner?.image,
                            _method: 'PUT',

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
                                    name="image"
                                    label="Image"
                                    type="file"
                                    error={touched.image ? errors.image : undefined}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = event.target.files?.[0];
                                        setFieldValue('image', file);
                                    }}
                                />
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

export default EditPartnerModal;
