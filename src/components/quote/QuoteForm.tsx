import React, { useState } from 'react';
import { ClientInfo } from './ClientInfo';
import { SpaceDetails } from './SpaceDetails';
import { ProductSelection } from './ProductSelection';

export function QuoteForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, name: 'Client Information' },
    { id: 2, name: 'Space Details' },
    { id: 3, name: 'Product Selection' },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center mb-8">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`relative ${step.id !== steps.length ? 'pr-8 sm:pr-20' : ''}`}
            >
              <div className="flex items-center">
                <div
                  className={`${
                    step.id <= currentStep
                      ? 'bg-indigo-600'
                      : 'bg-gray-200'
                  } h-8 w-8 rounded-full flex items-center justify-center`}
                >
                  <span className="text-white font-medium">{step.id}</span>
                </div>
                <span className="ml-4 text-sm font-medium text-gray-900">
                  {step.name}
                </span>
              </div>
              {step.id !== steps.length && (
                <div className="hidden sm:block absolute top-4 left-full h-0.5 w-16 bg-gray-200">
                  <div
                    className={`h-0.5 ${
                      step.id < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {currentStep === 1 && (
        <ClientInfo onNext={() => setCurrentStep(2)} />
      )}
      {currentStep === 2 && (
        <SpaceDetails
          onBack={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
        />
      )}
      {currentStep === 3 && (
        <ProductSelection
          onBack={() => setCurrentStep(2)}
          onSubmit={() => console.log('Submit quote')}
        />
      )}
    </div>
  );
}