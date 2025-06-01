import React from 'react';
import siteConfig, { getNextPayPalAccount, validateConfig } from '../config/siteConfig';

const ConfigExample: React.FC = () => {
  // Example of using the configuration
  const errors = validateConfig();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Site Configuration Example</h1>
      
      {/* Show validation errors if any */}
      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold mb-2">Configuration Errors:</h3>
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Basic Site Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Basic Site Information</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Site Name:</strong> {siteConfig.siteName}</p>
          <p><strong>Support Email:</strong> {siteConfig.supportEmail}</p>
          <p><strong>Business Hours:</strong> {siteConfig.businessHours.start} - {siteConfig.businessHours.end} {siteConfig.businessHours.timezone}</p>
        </div>
      </section>
      
      {/* PayPal Rotation Example */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">PayPal Account Rotation</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="mb-4">Click the button to see how PayPal accounts rotate:</p>
          <button
            onClick={() => {
              const account = getNextPayPalAccount();
              alert(`Next PayPal Account:\nEmail: ${account.email}\nLink: ${account.link}\nName: ${account.name}`);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Get Next PayPal Account
          </button>
        </div>
      </section>
      
      {/* Feature Flags */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
        <div className="bg-gray-100 p-4 rounded">
          <ul className="space-y-2">
            <li>Live Chat: {siteConfig.features.liveChat ? '✅ Enabled' : '❌ Disabled'}</li>
            <li>Promo Codes: {siteConfig.features.promoCodesEnabled ? '✅ Enabled' : '❌ Disabled'}</li>
            <li>Express Delivery: {siteConfig.features.expressDeliveryEnabled ? '✅ Enabled' : '❌ Disabled'}</li>
            <li>Multi-Currency: {siteConfig.features.multiCurrencyEnabled ? '✅ Enabled' : '❌ Disabled'}</li>
            <li>Email Notifications: {siteConfig.features.emailNotificationsEnabled ? '✅ Enabled' : '❌ Disabled'}</li>
            <li>Discord Bot: {siteConfig.features.discordBotEnabled ? '✅ Enabled' : '❌ Disabled'}</li>
            <li>Maintenance Mode: {siteConfig.features.maintenanceMode ? '⚠️ Active' : '✅ Normal'}</li>
          </ul>
        </div>
      </section>
      
      {/* Express Delivery Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Express Delivery</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Fee:</strong> ${siteConfig.expressDelivery.fee}</p>
          <p><strong>Estimated Time:</strong> {siteConfig.expressDelivery.estimatedTime}</p>
        </div>
      </section>
      
      {/* Currency Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Currency Settings</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Default Currency:</strong> {siteConfig.currency.defaultCurrency}</p>
          <p><strong>Supported Currencies:</strong> {siteConfig.currency.supportedCurrencies.join(', ')}</p>
        </div>
      </section>
      
      {/* API Configuration */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>API Base URL:</strong> {siteConfig.api.baseUrl}</p>
          <p><strong>Steam API Key:</strong> {siteConfig.api.steamApiKey ? '✅ Configured' : '❌ Not configured'}</p>
        </div>
      </section>
    </div>
  );
};

export default ConfigExample; 