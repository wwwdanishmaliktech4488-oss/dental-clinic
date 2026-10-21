import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto p-8 prose prose-blue">
      <div className="mb-8">
        <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Privacy Notice</h1>
      
      <p className="mb-4">
        This clinic is committed to protecting your personal data. This privacy notice explains how we collect and use your information when you use our website.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">What information do we collect?</h2>
      <p className="mb-4">
        When you submit an enquiry, we collect your name, email address, phone number, and any message you provide. 
        <strong> Please do not include sensitive medical details in the enquiry form.</strong>
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">How do we use your information?</h2>
      <p className="mb-4">
        We use your information solely to respond to your enquiry and arrange any requested appointments. We do not sell your data to third parties.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">How long do we keep it?</h2>
      <p className="mb-4">
        We retain enquiry data for up to 90 days unless you become a registered patient, at which point standard clinical records apply.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">Your rights</h2>
      <p className="mb-4">
        Under the UK GDPR, you have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, please contact the clinic directly.
      </p>
    </div>
  );
}