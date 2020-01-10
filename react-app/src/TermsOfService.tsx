/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import styled, { css, keyframes } from "styled-components/macro";
import { LoadedApp } from "./AppContainer";
import { Card } from "./components/Card";
import { LegalDoc } from "./components/LegalDoc";
// eslint-disable-next-line

export const TermsOfService: React.FC = (props) => {
  return (
    <Card maxWidth="768px">
      <LegalDoc>
        <h1 id="terms-of-service">Terms of Service</h1>
        <p>
          These Terms of Service (“Terms”, “Terms of Service”, “Agreement”, or
          “Service Agreement”) govern your relationship with the Jam Service
          (the “Service”) operated by Online Together, Inc. (“us”, “we”, or
          “our”). It is important that you read this carefully because you will
          be legally bound to these terms.
        </p>
        <p>
          Your access to and use of the Service is based on your acceptance of
          and compliance with these Terms. These Terms apply to all visitors,
          users, customers, and others who access or use the Service.
        </p>
        <p>
          By accessing or using the Service you agree to be bound by these Terms
          and accept all legal consequences. If you do not agree to the terms
          and conditions of this Agreement, in whole or in part, you must not
          use the Service.
        </p>
        <h2 id="description-of-service">Description of Service</h2>
        <p>
          The “Service” means (a) Jam’s password managing, password sharing,
          administrative and related systems and technologies, as well as the
          website <a href="https://jam.link/">https://jam.link/</a> (the
          “Site”), and (b) all software, applications, data, text, images, and
          other content made available by or on behalf of Jam. Any modifications
          to the Service are also subject to these Terms. Jam reserves the right
          to modify or discontinue the Service or any feature or functionality
          thereof at any time without notice. All rights, title and interest in
          and to the Service will remain with and belong exclusively to Jam.
        </p>
        <p>
          Your Master Password is critical to the security of your Account. It
          is used to generate the encryption keys used to protect Secured Logins
          (as defined in the “Features and Functions” section) and to transfer
          Secured Logins among your authorized devices. ONLINE TOGETHER, INC.
          DOES NOT STORE, HAVE ACCESS TO, OR HAVE ANY MEANS OF RECREATING OR
          RETRIEVING YOUR MASTER PASSWORD OR ACCESSING SECURED LOGINS IF YOU
          LOSE YOUR MASTER PASSWORD. This is an essential security feature
          intended to protect your Secured Data should our systems be
          compromised. We are not responsible for any inability to access your
          Account or Secured Data caused by loss of your Master Password.
        </p>
        <h2 id="features-and-functions">Features and Functions</h2>
        <p>
          The Service offers features designed to save you time, protect your
          data, and facilitate sharing with other users of the Service. We may
          remove features from the Service at any time. While we strive to
          ensure the proper operation of the Service, we explicitly do not
          guarantee that they will work properly at all times, be error-free, or
          be available on an uninterrupted basis. It is your responsibility to
          comply with this Agreement when using the Service, and you acknowledge
          the following:
        </p>
        <ol style={{ listStyleType: "decimal" }}>
          <li>
            <p>
              <strong>Secured Logins</strong>—The Service can be used to store
              authentication data for other services, including but not limited
              to usernames, emails, passwords, one time password keys, security
              questions, and notes. While we use strong encryption and other
              security measures to protect Secured Logins, we do not guarantee
              that Secured Logins are or will be 100% protected. Online
              Together, Inc. does not and cannot screen Secured Logins. You are
              solely responsible for the accuracy of the Secured Logins and how
              you use them.
            </p>
          </li>
          <li>
            <p>
              <strong>Passwords</strong>—While the passwords created by the
              Service are designed to be as secure as possible, we cannot
              guarantee their security, and we explicitly do not claim that they
              are immune to attack. Nor do we guarantee that the password
              generator will work properly with all Third-Party Services.
            </p>
          </li>
          <li>
            <p>
              <strong>Sharing</strong>—If you use the sharing features of the
              Service, you (i) authorize us to share the data you select with
              the individual(s) you choose, and you warrant that you have the
              right to do so (e.g., you may not share a password to a website or
              platform that prohibits shared credentials) You are solely
              responsible for granting and revoking sharing privileges and the
              consequences of all actions recipients take with your shared data.
            </p>
          </li>
          <li>
            <p>
              <strong>Syncing</strong>—If you access the Service from multiple
              devices, updates to Secured Logins made on one device may not be
              available on another device if (i) that device is unable to access
              the internet or Online Together’s servers; (ii) the App is
              improperly configured, or you have not installed the most recent
              version of the App; (iii) you uninstall the App from that device,
              or (iv) you forget your Master Password.
            </p>
          </li>
        </ol>
        <h2 id="prohibited-usage">Prohibited Usage</h2>
        <p>
          Usage of the service for unlawful purposes is strictly prohibited. It
          shall represent immediate grounds for termination of access to the
          Service and for potential referral to law-enforcement agencies.
          Unlawful purposes include, but are not limited to:
        </p>
        <ul>
          <li>
            Trafficking in the passwords of others, including passwords that
            have been stolen, hacked, or otherwise obtained without
            authorization;
          </li>
          <li>
            Sharing or offering to share passwords in connection with
            ransomware, extortion, fraud, bribery, smuggling, terrorism, digital
            piracy, or any other criminal activities, including efforts to
            unlawfully bypass paywalls or to otherwise facilitate unauthorized
            access to computer systems;
          </li>
          <li>
            Sharing or offering to share passwords that provide access to
            unlawful materials, including child pornography, nonconsentual adult
            pornography, blueprints or schematics for weapons systems or
            export-restricted goods, or images or recordings of coercion, abuse,
            torture, and other illegal violence against humans or animals;
          </li>
        </ul>
        <p>
          You are responsible for ensuring that your use of the Service does not
          constitute activity with an unlawful purpose. It is your
          responsibility to monitor the Terms of Service of third-party
          platforms or networks to ensure that your password-sharing activities
          comply with the policies of their administrators.
        </p>
        <h2 id="accounts">Accounts</h2>
        <p>
          When you create an account with us, you must provide information that
          is accurate, complete, and current at all times. Failure to do so
          constitutes a breach of the Terms.
        </p>
        <p>
          You are responsible for safeguarding the password that you use to
          access the Service and for any activities or actions performed with
          that password, both on the Service and on third-party websites or
          platforms.
        </p>
        <p>
          You agree not to disclose your password for the Service to any third
          party. You must notify us immediately upon becoming aware of any
          breach of security or unauthorized use of your account.
        </p>
        <p>
          You may not use as a username the name of another person or entity or
          that is not lawfully available for use, a name or trademark that is
          subject to any rights of another person or entity without appropriate
          authorization, or a name that is otherwise deceptive, offensive,
          vulgar, or obscene.
        </p>
        <h2 id="intellectual-property">Intellectual Property</h2>
        <p>
          The Service and all contents, including but not limited to text,
          images, graphics or code are the property of Online Together, Inc. and
          are protected by copyright, trademarks, database and other
          intellectual property rights. You may display and copy, download or
          print portions of the material from the different areas of the Service
          only for your own non-commercial use. Any other use is strictly
          prohibited and may violate copyright, trademark and other laws. These
          Terms do not grant you a license to use any trademark of Online
          Together, Inc. or its affiliates. You further agree not to use, change
          or delete any proprietary notices from materials downloaded from the
          Service.
        </p>
        <h2 id="user-generated-content">User-Generated Content</h2>
        <p>
          “Your Data” means any data and content which you upload, store,
          retrieve, or otherwise make available through the Service. You retain
          all of the rights to Your Data. You agree to grant Online Together,
          Inc. a license to store, retrieve, backup, restore, and otherwise copy
          Your Data so that we may provide you with the Service.
        </p>
        <h2 id="links-to-other-web-sites">Links To Other Web Sites</h2>
        <p>
          The Service may contain links to third-party web sites or services
          that are not owned or controlled by Online Together, Inc.
        </p>
        <p>
          Online Together, Inc. has no control over, and assumes no
          responsibility for, the content, privacy policies, or practices of any
          third party web sites or services. You further acknowledge and agree
          that Online Together, Inc. shall not be responsible or liable,
          directly or indirectly, for any damage or loss caused or alleged to be
          caused by or in connection with use of or reliance on any such
          content, goods or services available on or through any such websites
          or services.
        </p>
        <p>
          We strongly advise you to read the terms and conditions and privacy
          policies of any third-party web sites or services that you visit.
        </p>
        <h2 id="operational-emails">Operational Emails</h2>
        <p>
          By using the Service, you authorize the Service to send you
          operational emails required to provide the Service. These emails
          include, but are not limited to, billing emails, account activity
          emails, and service updates.
        </p>
        <h2 id="termination">Termination</h2>
        <p>
          You are entitled to cease using our Services at any time and for any
          reason without notice to us.
        </p>
        <p>
          To keep the Service safe and well maintained, we may need to terminate
          accounts for violations of these Terms. In the following circumstances
          we will provide notice to you prior to termination of your account:
          (a) you are in breach of these Terms; or (b) you are using our
          Services in a way that can cause or has caused a risk of harm or loss
          to either Jam or our other customers.
        </p>
        <p>
          In such an event, our notice will be via email to the registered
          account holders. If you remedy the issues that cause us to send the
          notice, to our satisfaction, then we will not terminate your access or
          license to our Services. If you do not remedy the outstanding causes
          of our termination notice in these circumstances, then we will
          terminate your account. In the event of such a termination, Jam may
          choose to not provide the ability to take your data with you.
        </p>
        <p>
          All provisions of the Terms shall survive termination, including
          without limitation: ownership provisions, warranty disclaimers,
          indemnity and limitations of liability. Upon termination, your right
          to use the Service will immediately cease.
        </p>
        <h2 id="limitation-of-liability">Limitation Of Liability</h2>
        <p>
          Online Together, Inc., its directors, employees, partners, agents,
          suppliers, or affiliates, shall not be liable for any loss or damage,
          indirect, incidental, special, consequential or punitive damages,
          including without limitation, economic or non-economic loss or damage
          to electronic media or data, goodwill, or other intangible losses,
          resulting from (i) your access to or use of the Service; (ii) your
          inability to access or use the Service; (iii) any conduct or content
          of any third-party on or related to the Service; (iv) any content
          obtained from or through the Service; and (v) the unauthorized access
          to, use of or alteration of your transmissions or content, whether
          based on warranty, contract, tort (including negligence) or any other
          claim in law, whether or not we have been informed of the possibility
          of such damage, and even if a remedy set forth herein is found to have
          failed its essential purpose.
        </p>
        <h2 id="disclaimer-and-non-waiver-of-rights">
          Disclaimer And Non-Waiver of Rights
        </h2>
        <p>
          Your use of the Service is at your own risk. It is provided on an “AS
          IS” and “AS AVAILABLE” basis. The Service is provided without
          warranties of any kind, whether express or implied, including, but not
          limited to, implied warranties of merchantability, fitness for a
          particular purpose, non-infringement or course of performance, except
          as provided for under the laws of the State of California. In such
          cases, the State of California’s law shall apply to the extent
          necessary.
        </p>
        <p>
          Online Together, Inc. its subsidiaries, affiliates, and its licensors
          do not warrant that a) the Service will function uninterrupted, secure
          or available at any particular time or location; b) any errors or
          defects will be corrected; c) the Service is free of viruses or other
          harmful components; or d) the results of using the Service will meet
          your requirements.
        </p>
        <p>
          If you breach any of these Terms and Online Together, Inc. chooses not
          to immediately act, or chooses not to act at all, Online Together,
          Inc. will still be entitled to all rights and remedies at any later
          date, or in any other situation, where you breach these Terms. Online
          Together, Inc. does not waive any of its rights. Online Together, Inc.
          shall not be responsible for any purported breach of these Terms
          caused by circumstances beyond its control. A person who is not a
          party to these Terms shall have no rights of enforcement.
        </p>
        <p>
          You may not assign, sub-license or otherwise transfer any of your
          rights under these Terms.
        </p>
        <h2 id="governing-law">Governing Law</h2>
        <p>
          This Agreement shall be governed by and construed in accordance with
          the laws of the State of California, without reference to any
          jurisdiction’s conflict of laws principles, and all proceedings
          relating to the subject matter hereof shall be maintained exclusively
          in the courts situated in San Francisco, California. Customer hereby
          consents to personal jurisdiction and venue therein and hereby waives
          any right to object to personal jurisdiction or venue.
        </p>
        <h2 id="dispute-resolution-arbitration">
          Dispute Resolution (Arbitration)
        </h2>
        <p>
          <strong>
            Attention: This provision limits your right to a jury trial. To save
            time and money, it requires the use of an alternative mechanism for
            resolving disputes.
          </strong>
        </p>
        <p>
          Specifically, all disputes and questions whatsoever which shall arise
          between Online Together, Inc. and you in connection with this Service
          Agreement, or the construction or application thereof or any provision
          contained in this Service Agreement or as to any act, deed or omission
          of any party or as to any other matter in any way relating to this
          Service Agreement, shall be resolved through binding arbitration.
        </p>
        <p>
          Such arbitration shall be conducted by a single arbitrator, under the
          JAMS Comprehensive Arbitration Rules and Procedures, and shall include
          the JAMS Optional Arbitration Appeal Procedure.
        </p>
        <p>
          Unless otherwise agreed to by the parties, arbitration shall be held
          in the City of San Francisco, California. Arbitration will be subject
          to the Federal Arbitration Act and not any state arbitration law.
          Judgment upon the award rendered by the arbitrator may be entered in
          any court having jurisdiction.
        </p>
        <h2 id="dmca-notice-takedown-procedure">
          DMCA Notice &amp; Takedown Procedure
        </h2>
        <p>
          We abide by the federal Digital Millennium Copyright Act
          (&quot;DMCA&quot;) by responding to properly submitted notices notices
          of alleged infringement. In response to DMCA notices, we may remove or
          disable access to materials that are claimed to be infringing. In the
          event that we take that step, we will make a good-faith attempt to
          contact the person who submitted the materials that are affected, so
          that said individual can have an opportunity to make a
          counter-notification in accordance with the DMCA.
        </p>
        <h3 id="notification">Notification</h3>
        <p>
          To file a notice of infringing material on the Service, please provide
          a notification containing the following information:
        </p>
        <ol style={{ listStyleType: "decimal" }}>
          <li>
            Sufficient details for us to reasonably identify the work claimed to
            be infringed or, in the case of multiple works, a representative
            sample (e.g., a URL to the original work or works)
          </li>
          <li>
            Sufficient details for us to reasonably locate the material that is
            claimed to be infringing (e.g., the URL of a page on the service
            containing the material)
          </li>
          <li>
            Sufficient contact information for us to reach you (e.g., name,
            address, telephone number, email address)
          </li>
          <li>
            A statement that you have a good faith belief that the material
            claimed to be infringing is not authorized by the copyright owner,
            its agent, or the law
          </li>
          <li>
            A statement, made under penalty of perjury, that the notification is
            accurate and that you are authorized to act on behalf of the
            copyright owner.
          </li>
          <li>Your physical or electronic signature.</li>
        </ol>
        <p>You must send this notice to:</p>
        <p>
          <a href="mailto:dmca@jam.link">dmca@jam.link</a>
        </p>
        <h3 id="counter-notification">Counter Notification</h3>
        <p>
          If material you have submitted to the Service has been removed or
          disabled pursuant to a DMCA notice, you may file a
          counter-notification. Your counter-notification should contain:
        </p>
        <ol style={{ listStyleType: "decimal" }}>
          <li>
            Identification of the material that has been removed or disabled,
            including the location where it previously appeared within the
            Service
          </li>
          <li>
            A statement, made under penalty of perjury, that you have a good
            faith belief that the material was removed of disabled based on a
            mistake, a misidentification, or an abuse of the DMCA process
          </li>
          <li>
            Sufficient information for us to contact you, including your name,
            address, and telephone number
          </li>
          <li>
            A statement that you (a) consent to the jurisdiction of the Federal
            District Court for the judicial district in which your address is
            located or, if your address is outside of the United States, for any
            judicial district in which we may be found and (b) will accept
            service of process from the person who submitted the DMCA request
          </li>
          <li>Your physical or electronic signature.</li>
        </ol>
        <p>You must send this counter-notification to</p>
        <p>
          <a href="mailto:undo.dmca@jam.link">undo.dmca@jam.link</a>
        </p>
        <h2 id="termination-of-accounts">Termination of Accounts</h2>
        <p>
          Users who repeatedly violate copyright or other intellectual property,
          or whose first violation we determine to manifest an intent to engage
          in future repeated violations, will be blocked from accessing the
          Service. We reserve the right to make this determination in our sole
          discretion. In the event that a user's access to the Service is
          blocked, all data associated with its account may be lost.
        </p>
        <h2 id="changes">Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. If a revision is material we will make
          reasonable efforts to provide at least 30 days’ notice prior to any
          new terms taking effect. What constitutes a material change will be
          determined at our sole discretion. By continuing to access or use our
          Service after those revisions become effective, you agree to be bound
          by the revised terms. If you do not agree to the new terms, in whole
          or in part, please stop using the website and the Service.
        </p>
      </LegalDoc>
    </Card>
  );
};
