import React from 'react';

import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';
import { Container } from '@/shared/components/layout/Container';

export default function AIScribingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Container size="lg">
          <div className="mx-auto max-w-4xl py-8">
            <div className="prose prose-gray max-w-none">
              <h1 className="mb-8 text-3xl font-bold text-gray-900">
                AI Scribing in NZ Primary Care: What Busy GPs Need to Know
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-gray-700">
                Primary care in New Zealand faces significant workload and time pressures. Generative Artificial Intelligence (GenAI), including tools known as AI scribes, is emerging as a potential technology to help manage these demands. These tools are being explored and used by GPs across the country.
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                    Learning More About AI in Primary Care
                  </h2>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    Understanding AI, its potential, and its risks is key to using these tools safely and effectively. Several valuable resources are available for GPs in New Zealand.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">
                        The AI in Primary Care Working Group
                      </h3>
                      <p className="mb-3 leading-relaxed text-gray-700">
                        This collaborative group, a partnership of multiple organisations across Aotearoa, is interested and invested in enhancing AI use in Primary Care. They are developing resources for primary care, including guidance documents, webinars, and potentially e-learning modules. They conduct surveys to track the uptake of AI tools in primary care. The first survey in July/August attracted over 300 responses, with a second round conducted between January and February 2025. Note-taking and scribing tools were the most used AI technologies among respondents in the second survey.
                      </p>
                      <a
                        href="https://gpnz.org.nz/our-work/ai-in-primary-care-group/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        Visit GPNZ AI Working Group →
                      </a>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">
                        WellSouth Primary Health Network
                      </h3>
                      <p className="mb-3 leading-relaxed text-gray-700">
                        WellSouth is part of the AI in Primary Care Working Group and has developed comprehensive guidance for primary care on using GenAI. This guide covers the regulatory framework, risks, benefits, and practical implementation steps. They also offer patient information resources, including editable posters and handouts, to assist with the consent process. WellSouth has made its guide available nationwide through the AI working group. Their resources offer best-practice advice for using AI in primary care without compromising patient care or data security.
                      </p>
                      <a
                        href="https://wellsouth.nz/provider-access/clinical-resources/ai-in-primary-care"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        Access WellSouth AI Guidance →
                      </a>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">
                        WellSouth LMS Training
                      </h3>
                      <p className="mb-3 leading-relaxed text-gray-700">
                        WellSouth, in partnership with Hendrix Health and Collaborative Aotearoa, offers online training modules covering Introduction to AI, Prompting, Ethics, and Effective AI Scribing. These modules are specifically tailored for primary and community care and are available free of charge. They are accessible via the WellSouth LMS for GPs, Nurses, and Admin staff, and you can create an account if you don't have one. SCORM 1.2 course files are also available for PHOs and community care organisations to host on their own platforms.
                      </p>
                      <a
                        href="https://wellsouth.nz/provider-access/clinical-resources/ai-in-primary-care#TrainingResources_ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        Access Training Modules →
                      </a>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">
                        Webinar Series
                      </h3>
                      <p className="mb-4 leading-relaxed text-gray-700">
                        A three-part AI series put together by the AI in Primary Care Working Group covers topics like enhancing AI literacy and practical integration, effective AI scribing demonstrations, and navigating ethics, risks, and workforce readiness. Other relevant webinars hosted by Healthify NZ, HiNZ, and NZ Telehealth are also recommended resources by WellSouth.
                      </p>
                      <div className="space-y-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <h4 className="mb-2 font-semibold text-gray-900">Session 1: Enhancing AI Literacy & Practical Tips</h4>
                          <p className="mb-2 text-sm text-gray-600">
                            Explores AI usage in healthcare and offers practical guidance on integrating AI tools into practice, including patient consent and privacy considerations.
                          </p>
                          <a
                            href="https://www.youtube.com/watch?v=d7Z6kh0qzuY"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            Watch on YouTube →
                          </a>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <h4 className="mb-2 font-semibold text-gray-900">Session 2: Effective AI Scribing Demonstration</h4>
                          <p className="mb-2 text-sm text-gray-600">
                            Live AI scribing demonstration in a real-time consultation, showing how AI can streamline documentation and enhance workflows.
                          </p>
                          <a
                            href="https://www.youtube.com/watch?v=2uSk0tWltR0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            Watch on YouTube →
                          </a>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <h4 className="mb-2 font-semibold text-gray-900">Session 3: Navigating Ethics, Risks and Workforce Readiness</h4>
                          <p className="mb-2 text-sm text-gray-600">
                            Focuses on ethical dimensions of AI in healthcare, exploring challenges and strategies to build an AI-ready workforce.
                          </p>
                          <a
                            href="https://www.youtube.com/watch?v=YPylN-XeEM0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            Watch on YouTube →
                          </a>
                        </div>
                        <div className="mt-3">
                          <a
                            href="https://wellsouth.nz/provider-access/clinical-resources/ai-in-primary-care#AI_Webinars"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            View All WellSouth AI Webinars →
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">
                        Office of the Privacy Commissioner (OPC)
                      </h3>
                      <p className="mb-3 leading-relaxed text-gray-700">
                        The Privacy Commissioner has made statements regarding generative AI, emphasizing transparency, reading terms and conditions before use, and being aware of data handling practices, especially regarding data being sent overseas. Consulting OPC guidance is vital.
                      </p>
                      <a
                        href="https://www.privacy.org.nz/publications/guidance-resources/ai/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        Read OPC AI Guidance →
                      </a>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">
                        Te Whatu Ora Guidance
                      </h3>
                      <p className="mb-3 leading-relaxed text-gray-700">
                        Health New Zealand provides advice on the use of Large Language Models and Generative AI in healthcare, outlining risks and considerations. Their advice currently recommends caution against using GenAI for clinical purposes due to the lack of evaluation for risks.
                      </p>
                      <a
                        href="https://www.tewhatuora.govt.nz/health-services-and-programmes/digital-health/generative-ai-and-large-language-models"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        Read Te Whatu Ora Guidance →
                      </a>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                    What are AI Scribes?
                  </h2>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    At their core, AI scribes are tools that use advanced AI models, often based on Large Language Models (LLMs), to process audio from your consultations. They typically perform two main tasks:
                  </p>
                  <ol className="mb-4 list-decimal space-y-2 pl-6 text-gray-700">
                    <li>
                      <strong>Transcription:</strong>
                      {' '}
                      Converting the spoken conversation into text.
                    </li>
                    <li>
                      <strong>Summarisation:</strong>
                      {' '}
                      Taking the transcript and structuring it into a clinical note, often following specific templates.
                    </li>
                  </ol>
                  <p className="leading-relaxed text-gray-700">
                    These tools aim to help with documentation. They capture what is said but lack clinical judgment or the ability to truly understand context in a human sense.
                  </p>
                </section>

                <section>
                  <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                    Potential Benefits Highlighted by GPs
                  </h2>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    GPs who have experimented with or adopted AI scribing tools report several advantages:
                  </p>
                  <ul className="list-disc space-y-3 pl-6 text-gray-700">
                    <li>
                      <strong>Saves Time:</strong>
                      {' '}
                      A primary driver is the potential to reduce the time spent on note-writing. Some users report saving time. AI has the potential to reduce the burden of administration.
                    </li>
                    <li>
                      <strong>Reduces Cognitive Load:</strong>
                      {' '}
                      Decreases the mental effort involved in remembering and documenting complex consultations.
                    </li>
                    <li>
                      <strong>Improves Patient Interaction:</strong>
                      {' '}
                      By reducing the need to type during the consultation, GPs can maintain eye contact and focus more fully on the patient. Patients report enjoying and valuing interaction more when the GP is not focused on the screen and keyboard.
                    </li>
                    <li>
                      <strong>Creates Better Notes:</strong>
                      {' '}
                      Can produce clear, structured, and consistent consultation records. Some users have found their documentation quality significantly improved. Accurate records are required.
                    </li>
                    <li>
                      <strong>Assists with Other Tasks:</strong>
                      {' '}
                      Some tools can help draft referral letters, patient instructions, or summarise existing patient information. Transforming clinical notes into patient-friendly language is also seen as beneficial, especially with initiatives like open notes. AI can help draft templates for administrative processes like authorization letters.
                    </li>
                    <li>
                      <strong>Potential Medico-Legal Support:</strong>
                      {' '}
                      Accurate transcriptions could provide a detailed record of what was discussed, which might be helpful in case of future questions or complaints. Being able to go back to the verbatim transcript can be very helpful, for example, if a patient disputes the understanding of a procedure.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-6 text-2xl font-semibold text-red-800">
                    Critical Challenges and Risks (Things You MUST Be Aware Of)
                  </h2>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    Despite the potential benefits, using AI scribes comes with significant responsibilities and risks for GPs:
                  </p>

                  <div className="space-y-6">
                    <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-red-800">
                        Accuracy and Hallucinations
                      </h3>
                      <p className="mb-3 text-red-700">
                        AI models can "hallucinate" or generate information that wasn't part of the conversation. Notes can contain errors, omissions, or misinterpretations. One user noted that positive findings in examinations are usually picked up well, but negative findings can sometimes be recorded incorrectly. Crucially, you are responsible for the accuracy of any note entered into the patient record, regardless of whether AI generated it. Relying solely on unchecked AI output can be problematic.
                      </p>
                      <p className="font-semibold text-red-800">
                        Action: Always thoroughly check and edit AI-generated notes before saving them. This is crucial for accuracy and safety.
                      </p>
                    </div>

                    <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-orange-800">
                        Misinterpretation
                      </h3>
                      <p className="text-orange-700">
                        AI can struggle with accents, jargon, and local languages like te reo Māori. Some platforms are noted as being particularly poor at capturing te reo Māori. One user experienced the tool misattributing information to a patient when trying to build rapport using whakawhanaungatanga.
                      </p>
                    </div>

                    <div className="rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-purple-800">
                        Data Privacy and Security
                      </h3>
                      <p className="mb-3 text-purple-700">
                        This is a major concern when using cloud-based AI tools.
                      </p>
                      <ul className="mb-3 list-disc space-y-2 pl-6 text-purple-700">
                        <li>
                          <strong>Where is the data processed and stored?</strong>
                          {' '}
                          Many tools process data on overseas servers (e.g., US). If data is sent to America, the Americans have powers to access that data. This raises questions about data sovereignty, which is important, especially from a Māori perspective, as data is considered a taonga (treasure). Some tools are NZ owned and homed, highlighting local data sovereignty.
                        </li>
                        <li>
                          <strong>How is data used?</strong>
                          {' '}
                          Is patient data used to train the AI model? Some tools state that data is used internally for tool improvement but not sold. It's essential to verify how data is captured, processed, stored, and whether it is de-identified.
                        </li>
                      </ul>
                      <p className="font-semibold text-purple-800">
                        Action: Before using any AI scribe tool with real patient data, read the privacy policy and terms and conditions carefully. Understand how data is handled. Our survey showed that only 65% of GPs had fully read the terms and conditions of the platform they were using. Consider tools that prioritize data security and privacy aligned with NZ law.
                      </p>
                    </div>

                    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-blue-800">
                        Consent
                      </h3>
                      <p className="mb-3 text-blue-700">
                        Obtaining informed consent from patients for using an AI scribe is crucial and legally important. The current legal view is that consent should be sought prior to the consultation. If clinicians haven't read the terms and conditions, they cannot properly consent patients.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-blue-800">Methods:</h4>
                          <p className="text-blue-700">
                            A layered approach is recommended. This can include posters in waiting rooms, social media posts, text reminders before the consult, written consent, and explicit verbal consent at the start of the consultation. Written consent provides a clear record. A patient enrolment form with an AI clause is suggested as a vital step for future enrolments.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">What to tell patients:</h4>
                          <p className="text-blue-700">
                            Explain that a digital assistant is being used, that it records and transcribes the conversation, how the data is handled (referencing the tool's privacy policy), and that they have the right to opt out or pause the scribe. For young people, consent is often easy as they are familiar with AI, but older patients may be different.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">Survey Data:</h4>
                          <p className="text-blue-700">
                            A survey showed a significant proportion of GPs using AI scribes did not always ask for patient consent (40%).
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">Differing Views:</h4>
                          <p className="text-blue-700">
                            While many advocate for explicit consent, one GP shared that their practice moved away from making AI use the opening gambit, noting that health information is shared in many ways already, and no one objected to verbal consent when they initially used it. They felt there were "bigger fish to fry" regarding IT security like phishing training.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-yellow-800">
                        Regulatory Uncertainty
                      </h3>
                      <p className="text-yellow-700">
                        A specific regulatory framework for AI in NZ healthcare is still developing. Existing laws like the Privacy Act 2020 apply. Te Whatu Ora's advice currently recommends caution against using GenAI for clinical purposes due to the lack of evaluation for risks. There is international discussion about regulating AI tools as medical devices. Some products have been authorized as medical devices elsewhere, but not yet LLM-based AI scribes. It is hoped that national guidance and a vetting process will emerge.
                      </p>
                    </div>

                    <div className="rounded-lg border-l-4 border-gray-500 bg-gray-50 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-gray-800">
                        Need for Human Oversight
                      </h3>
                      <p className="text-gray-700">
                        There is a risk of automation bias – over-relying on or blindly trusting automated systems. You must critically review the output. AI should be viewed as a tool to support, not replace, clinical judgment. Using AI for diagnosis or treatment advice carries far greater risk than for summarisation and changes the nature of how clinicians think.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-6 text-2xl font-semibold text-green-800">
                    Practical Considerations for Busy GPs
                  </h2>
                  <ul className="list-disc space-y-3 pl-6 text-gray-700">
                    <li>
                      <strong>Experiment Safely:</strong>
                      {' '}
                      Before using any tool with patient data, try it out on test scenarios or with colleagues/family to understand its capabilities and limitations. Some tools offer free trials or limited functionality.
                    </li>
                    <li>
                      <strong>Build Checking Time into Your Workflow:</strong>
                      {' '}
                      Always allocate time to review and edit every AI-generated note. This is non-negotiable for accuracy and safety.
                    </li>
                    <li>
                      <strong>Prioritise Data Privacy and Security:</strong>
                      {' '}
                      Understand the tool's data handling practices by reading terms and conditions and privacy policies before processing any patient information. Consider if the tool is NZ owned and homed.
                    </li>
                    <li>
                      <strong>Establish a Clear Consent Process:</strong>
                      {' '}
                      Implement a layered approach in your practice to ensure patients are informed about the use of AI scribes and have given their consent. Every practice should have an AI policy.
                    </li>
                    <li>
                      <strong>Utilise Available Resources:</strong>
                      {' '}
                      Take advantage of the guidance and training offered by WellSouth, the AI working group, and other national bodies to deepen your understanding.
                    </li>
                    <li>
                      <strong>Maintain Human Oversight:</strong>
                      {' '}
                      Remember that AI is a tool. Your clinical judgment, diagnostic process, and the therapeutic relationship remain paramount. Do not over-rely on AI outputs.
                    </li>
                    <li>
                      <strong>Consider the Alternative:</strong>
                      {' '}
                      Weigh the risks and benefits against the alternative of delayed or incomplete notes.
                    </li>
                  </ul>
                </section>

                <div className="mt-12 rounded-lg bg-green-50 p-6">
                  <p className="text-lg font-medium text-green-900">
                    By approaching AI scribing cautiously, with a strong focus on privacy, consent, accuracy checking, and utilising available resources, GPs can explore its potential benefits while mitigating the associated risks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
