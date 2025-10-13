import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/sanity/lib/write-client';
import { client } from '@/sanity/lib/client';
import { sendInterestedSubmissionEmail } from '@/lib/emailNotifications';
import { getUserEmailPreferences } from '@/sanity/lib/user-preferences';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      startupId, 
      startupTitle, 
      userId, 
      name, 
      email, 
      phone,
      company,
      role,
      message, 
      investmentAmount,
      investmentType,
      experience,
      timeline,
      preferredContact,
      linkedin,
      website,
      location,
      howDidYouHear,
      consentToContact
    } = body;

    // Validate required fields
    if (!startupId || !name || !email || !message || !consentToContact) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Check if user is trying to show interest in their own startup
    try {
      const startup = await client.fetch(`
        *[_type == "startup" && _id == $startupId][0] {
          _id,
          title,
          author->{
            _id,
            name,
            email
          }
        }
      `, { startupId });

      if (!startup) {
        return NextResponse.json({ 
          success: false, 
          message: 'Startup not found' 
        }, { status: 404 });
      }

      // Check if the current user is the author of the startup
      if (startup.author && startup.author._id === session.user.id) {
        return NextResponse.json({ 
          success: false, 
          message: 'You cannot show interest in your own startup' 
        }, { status: 400 });
      }
    } catch (error) {
      console.error('Error checking startup ownership:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Error validating startup ownership' 
      }, { status: 500 });
    }

    // Save the form data to Sanity database
    const submissionData = {
      _type: 'interestedSubmission',
      startup: {
        _type: 'reference',
        _ref: startupId,
      },
      startupTitle,
      userId,
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      role: role || undefined,
      location: location || undefined,
      investmentAmount: investmentAmount || undefined,
      investmentType: investmentType || undefined,
      timeline: timeline || undefined,
      preferredContact: preferredContact || 'email',
      linkedin: linkedin || undefined,
      website: website || undefined,
      experience: experience || undefined,
      message,
      howDidYouHear: howDidYouHear || undefined,
      consentToContact,
      status: 'new',
      submittedAt: new Date().toISOString(),
    };

    // Add user reference if userId exists
    if (userId) {
      submissionData.user = {
        _type: 'reference',
        _ref: userId,
      };
    }

    const result = await writeClient.create(submissionData);

    console.log('Interested form submission saved:', {
      submissionId: result._id,
      startupId,
      startupTitle,
      userId,
      name,
      email,
      submittedAt: new Date().toISOString()
    });

    // Send email notification to startup owner (respect owner's email prefs)
    try {
      const ownerId = startup?.author?._id;
      if (ownerId) {
        const ownerPrefs = await getUserEmailPreferences(ownerId);
        if (!ownerPrefs.enabled || ownerPrefs.types?.interested === false) {
          console.log('🔕 Skipping interested email due to owner preferences');
          return NextResponse.json({ 
            success: true, 
            message: 'Interest submitted successfully (email skipped by preferences)' 
          });
        }
      }
      const emailData = {
        startupOwnerName: startup.author.name,
        startupOwnerEmail: startup.author.email,
        startupTitle,
        interestedUserName: name,
        interestedUserEmail: email,
        interestedUserPhone: phone,
        interestedUserCompany: company,
        interestedUserRole: role,
        message,
        investmentAmount,
        investmentType,
        timeline,
        preferredContact,
        linkedin,
        website,
        experience,
        howDidYouHear,
        submittedAt: new Date().toISOString(),
      };

      const emailResult = await sendInterestedSubmissionEmail(emailData);
      
      if (emailResult.success) {
        console.log('Email notification sent successfully');
      } else {
        console.error('Failed to send email notification:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Interest submitted successfully' 
    });

  } catch (error) {
    console.error('Error processing interested form:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process interest submission' 
    }, { status: 500 });
  }
}
