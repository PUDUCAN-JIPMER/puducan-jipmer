'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', data);
    alert('Thank you for your message! We will get back to you soon.');
    reset();
    setIsSubmitting(false);
  };

  return (
    <main className="flex-grow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            For any queries or technical issues related to the PuduCan Portal, please reach out to us
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 md:p-6 h-fit">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Contact Information
            </h2>
            <div className="space-y-4 md:space-y-5">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Institution:</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                  Jawaharlal Institute of Postgraduate Medical Education and Research (JIPMER)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Address:</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                  JIPMER Campus Rd, Gorimedu, Dhanvantari Nagar,<br />
                  Puducherry - 605006
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Email:</h3>
                <p className="text-blue-600 dark:text-blue-400 mt-1 text-sm md:text-base break-all">
                  PuduCan-support@jipmer.edu.in
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">Phone:</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">+91 2222 2222</p>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="Enter your full name"
                  className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.fullName ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.email ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('subject')}
                  type="text"
                  placeholder="What is this regarding?"
                  className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.subject ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.subject && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="Please provide details..."
                  className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-vertical dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.message ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.message && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}