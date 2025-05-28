import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>

      <div className="prose prose-gray max-w-none">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Privacy Policy for ConsultAI NZ
        </h1>

        <p className="mb-8 text-sm text-gray-600">
          <strong>Effective Date:</strong>
          {' '}
          {/* TODO: Insert actual effective date */}
          <span className="ml-2 rounded bg-yellow-100 px-2 py-1 text-yellow-800">
            [Insert Date - TODO: Update this]
          </span>
        </p>

        <div className="space-y-6">
          <p className="leading-relaxed text-gray-700">
            Welcome to ConsultAI NZ. We provide a software tool designed for General Practitioners (GPs)
            in New Zealand to assist with the administrative task of clinical note generation following
            patient consultations. Our tool uses artificial intelligence technology for live transcription
            and note summarisation. We understand the sensitive nature of the data processed in a healthcare
            context and are committed to protecting privacy in accordance with New Zealand law.
          </p>

          <p className="leading-relaxed text-gray-700">
            This Privacy Policy explains how we handle information when you use the ConsultAI NZ software.
          </p>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              1. Purpose of Data Collection
            </h2>
            <p className="leading-relaxed text-gray-700">
              The primary purpose of collecting and processing audio data is to provide the core functionality
              of the ConsultAI NZ software: to transcribe patient consultations and generate structured notes
              to assist the GP. This process is intended to reduce the administrative workload on GPs, allowing
              them to focus on patient care.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              2. Information We Process
            </h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              When you use ConsultAI NZ, we process the following types of information:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>
                <strong>Audio Data:</strong>
                {' '}
                The software captures audio from the consultation environment
                for real-time processing. This audio contains the spoken conversation during the consultation.
              </li>
              <li>
                <strong>Transcription Text:</strong>
                {' '}
                The audio data is converted into text transcription
                using a third-party service (Deepgram).
              </li>
              <li>
                <strong>Processed Text (Notes):</strong>
                {' '}
                The transcription text is processed by another
                third-party AI service (OpenAI) to generate a summary or structured note.
              </li>
              <li>
                <strong>User Account Information:</strong>
                {' '}
                When you register for ConsultAI NZ, we collect
                information necessary to set up and manage your account, such as your name and email address.
              </li>
              <li>
                <strong>Usage Data:</strong>
                {' '}
                We may collect information about how you use the ConsultAI NZ
                software, such as features accessed and frequency of use. This helps us improve the service.
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-gray-700">
              Crucially, the ConsultAI NZ software itself is designed not to permanently store audio data,
              transcription text, or processed notes unless you, as the GP, explicitly choose to save
              consultation information manually within the application or export it. The AI processing is
              temporary and occurs to generate the notes for your immediate review and use.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              3. How Information is Processed and Protected
            </h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              ConsultAI NZ relies on third-party AI services to perform transcription and note generation:
            </p>
            <ul className="list-disc space-y-4 pl-6 text-gray-700">
              <li>
                <strong>Deepgram for Transcription:</strong>
                {' '}
                Audio data is sent to Deepgram's service for
                transcription. Deepgram offers redaction features designed to automatically identify and
                remove sensitive information, such as Personally Identifiable Information (PII), from the
                transcription output. Deepgram states they maintain and meet requirements for multiple data
                privacy compliance frameworks and certifications, including SOC 2, GDPR, HIPAA, CCPA, and PCI.
                They can act as a Business Associate under US HIPAA legislation, and for GDPR/CCPA, they act
                as a data "processor" or "service provider". Deepgram is committed to protecting the
                confidentiality of client information and implements administrative, technical, and physical
                safeguards. They retain a security advisor and an independent Data Protection Officer.
              </li>
              <li>
                <strong>OpenAI for Note Generation:</strong>
                {' '}
                The transcription text (after redaction by
                Deepgram) is sent to OpenAI's service (specifically, via their API, which offers different
                data handling practices than consumer versions) for processing into structured notes. OpenAI's
                API terms state that data submitted via the API is generally not used to train or improve
                their models, unless users explicitly opt-in, and they do not sell user data to third parties.
                However, be aware that past practices and ongoing discussions have highlighted privacy concerns
                regarding OpenAI's handling of data, particularly for non-API usage and in relation to GDPR
                compliance. OpenAI relies on Standard Contractual Clauses (SCCs) for data transfers outside
                the European Economic Area, but data transfers to the US remain a point of consideration under
                various privacy laws. We aim to utilise the API versions to benefit from the stated
                data-not-used-for-training policy.
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-gray-700">
              While these third-party services employ security measures like encryption, it is important to
              understand that data is processed by them temporarily to provide the transcription and note output.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              4. Data Storage
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>
                <strong>Temporary Processing:</strong>
                {' '}
                Audio data, transcription text, and generated notes
                are processed temporarily by Deepgram and OpenAI via their APIs to provide the service's
                functionality. ConsultAI NZ does not retain these processed data points on its own servers
                after they have been presented to the GP for review and action.
              </li>
              <li>
                <strong>Manual Storage by GP:</strong>
                {' '}
                Patient consultation data is only stored long-term
                if you, the GP user, manually save the generated notes or other information within the
                ConsultAI NZ application or export it to another system, such as a Patient Management System
                (PMS). The responsibility for the storage, security, and handling of this manually saved
                patient data rests with the GP and their practice, in accordance with their legal obligations
                (see Section 6).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              5. Data Location
            </h2>
            <p className="leading-relaxed text-gray-700">
              The third-party AI services (Deepgram and OpenAI) process data on servers located outside of
              New Zealand. The processing of data outside of New Zealand is governed by the Privacy Act 2020,
              specifically Principle 12, which places restrictions on disclosing personal information to
              foreign persons or entities unless certain conditions are met, such as comparable safeguards
              or the individual's authorisation after being informed of potential differences in protection.
            </p>
            <p className="mt-4 leading-relaxed text-gray-700">
              ConsultAI NZ, as the provider of the software, and you, as the GP user, must ensure that the
              requirements for overseas disclosure are met when using the service to process patient information.
              We aim to select third-party processors with robust privacy commitments that align with
              internationally recognised standards (like GDPR readiness and SOC 2 certification mentioned by
              Deepgram), but it is your responsibility to satisfy yourself that the use of these services
              complies with your obligations under New Zealand law.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              6. GP's Privacy Responsibilities under New Zealand Law
            </h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              As a GP using ConsultAI NZ, you are the "agency" (or part of the agency, e.g., your practice)
              under the Privacy Act 2020 and the Health Information Privacy Code 2020 (HIPC 2020). This places
              significant legal responsibilities on you regarding the collection, use, storage, and disclosure
              of your patients' health information.
            </p>
            <p className="mb-4 leading-relaxed text-gray-700">
              Specifically, you are responsible for:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>
                <strong>Obtaining Consent:</strong>
                {' '}
                You must obtain appropriate informed consent from your
                patients before recording their consultations and using an AI tool like ConsultAI NZ to
                process their health information for transcription and note-taking purposes (referencing
                HIPC 2020 Principles 1, 3, 4). You must explain to patients how their information will be
                handled, including the use of third-party AI services, the temporary processing of audio
                and text data, and the fact that data may be processed outside of New Zealand.
              </li>
              <li>
                <strong>Minimising Collection:</strong>
                {' '}
                Ensuring that only necessary information is collected
                and processed.
              </li>
              <li>
                <strong>Accuracy:</strong>
                {' '}
                Reviewing the AI-generated transcription and notes for accuracy
                before saving or using them, as AI transcription can sometimes make mistakes and you have
                obligations under HIPC 2020 (Principle 8) regarding the accuracy of health information.
              </li>
              <li>
                <strong>Storage and Security:</strong>
                {' '}
                Ensuring that any patient information you choose to
                manually save within ConsultAI NZ or export is stored securely and protected against
                unauthorised access or disclosure (HIPC 2020 Principle 5).
              </li>
              <li>
                <strong>Data Retention:</strong>
                {' '}
                Retaining health information only for as long as necessary
                (HIPC 2020 Principle 9).
              </li>
              <li>
                <strong>Breach Notification:</strong>
                {' '}
                Understanding and complying with your obligations to
                notify the Privacy Commissioner and affected individuals in the event of a privacy breach
                that causes or is likely to cause serious harm.
              </li>
              <li>
                <strong>Overseas Disclosure Compliance:</strong>
                {' '}
                Ensuring that the use of services that
                process data outside NZ complies with Privacy Act 2020 Principle 12.
              </li>
              <li>
                <strong>Privacy Officer:</strong>
                {' '}
                Ensuring your practice has a designated Privacy Officer.
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-gray-700">
              ConsultAI NZ acts as a data processor for you, assisting in the technical processing of audio
              and text. However, you remain the data controller and are primarily responsible for the lawful
              and secure handling of patient data processed using the application.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              7. Compliance with New Zealand Privacy Law
            </h2>
            <p className="leading-relaxed text-gray-700">
              ConsultAI NZ is committed to complying with the Privacy Act 2020 and operating in a manner
              that supports your compliance with the Health Information Privacy Code 2020. The Office of
              the Privacy Commissioner is the national data protection authority in New Zealand.
            </p>
            <p className="mt-4 leading-relaxed text-gray-700">
              We take measures to protect the confidentiality and security of your data and the data processed
              through our service. However, given the processing of data by third parties outside of New Zealand,
              careful consideration must be given to Principle 12 of the Privacy Act 2020.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              8. Your Rights (as a GP User)
            </h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              As a user of ConsultAI NZ, you have rights under the Privacy Act 2020 regarding the personal
              information we hold about you (e.g., your account information). These rights include:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>The right to request access to your personal information.</li>
              <li>The right to request correction of your personal information if you believe it is inaccurate.</li>
            </ul>
            <p className="mt-4 leading-relaxed text-gray-700">
              You can exercise these rights by contacting us using the details provided below.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              9. Security Measures
            </h2>
            <p className="leading-relaxed text-gray-700">
              We implement reasonable technical and organisational measures to protect the information
              processed and stored by the ConsultAI NZ application against unauthorised access, disclosure,
              alteration, or destruction. However, no system can be guaranteed to be 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              10. Changes to this Privacy Policy
            </h2>
            <p className="leading-relaxed text-gray-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, or legal requirements. We will notify you of any significant changes by posting
              the updated policy on our website or within the application.
            </p>
          </section>

          <section>
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">
              11. Contact Us
            </h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              If you have any questions or concerns about this Privacy Policy or our privacy practices,
              please contact us at:
            </p>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-gray-700">
                <strong>ConsultAI NZ</strong>
                <br />
                {/* TODO: Insert actual contact details */}
                <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800">
                  [Insert Physical Address in NZ - TODO: Update this]
                </span>
                <br />
                <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800">
                  [Insert Email Address - TODO: Update this]
                </span>
                <br />
                <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800">
                  [Insert Phone Number - TODO: Update this]
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
