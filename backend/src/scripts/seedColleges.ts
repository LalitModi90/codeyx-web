import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { University } from '../models/university.model';

const topIndianColleges = [
  // IITs
  { name: 'Indian Institute of Technology Bombay', shortName: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Indian Institute of Technology Delhi', shortName: 'IIT Delhi', city: 'New Delhi', state: 'Delhi' },
  { name: 'Indian Institute of Technology Madras', shortName: 'IIT Madras', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Indian Institute of Technology Kanpur', shortName: 'IIT Kanpur', city: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Indian Institute of Technology Kharagpur', shortName: 'IIT Kharagpur', city: 'Kharagpur', state: 'West Bengal' },
  { name: 'Indian Institute of Technology Roorkee', shortName: 'IIT Roorkee', city: 'Roorkee', state: 'Uttarakhand' },
  { name: 'Indian Institute of Technology Guwahati', shortName: 'IIT Guwahati', city: 'Guwahati', state: 'Assam' },
  { name: 'Indian Institute of Technology Hyderabad', shortName: 'IIT Hyderabad', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Indian Institute of Technology BHU', shortName: 'IIT BHU', city: 'Varanasi', state: 'Uttar Pradesh' },
  
  // NITs
  { name: 'National Institute of Technology Tiruchirappalli', shortName: 'NIT Trichy', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'National Institute of Technology Karnataka', shortName: 'NITK Surathkal', city: 'Surathkal', state: 'Karnataka' },
  { name: 'National Institute of Technology Rourkela', shortName: 'NIT Rourkela', city: 'Rourkela', state: 'Odisha' },
  { name: 'National Institute of Technology Warangal', shortName: 'NIT Warangal', city: 'Warangal', state: 'Telangana' },
  { name: 'National Institute of Technology Calicut', shortName: 'NIT Calicut', city: 'Kozhikode', state: 'Kerala' },
  { name: 'Visvesvaraya National Institute of Technology', shortName: 'VNIT Nagpur', city: 'Nagpur', state: 'Maharashtra' },
  { name: 'Malaviya National Institute of Technology', shortName: 'MNIT Jaipur', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'Motilal Nehru National Institute of Technology', shortName: 'MNNIT Allahabad', city: 'Prayagraj', state: 'Uttar Pradesh' },

  // IIITs
  { name: 'International Institute of Information Technology Hyderabad', shortName: 'IIIT Hyderabad', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Indraprastha Institute of Information Technology Delhi', shortName: 'IIIT Delhi', city: 'New Delhi', state: 'Delhi' },
  { name: 'International Institute of Information Technology Bangalore', shortName: 'IIIT Bangalore', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'Indian Institute of Information Technology Allahabad', shortName: 'IIIT Allahabad', city: 'Prayagraj', state: 'Uttar Pradesh' },
  
  // BITS Pilani
  { name: 'Birla Institute of Technology and Science, Pilani', shortName: 'BITS Pilani', city: 'Pilani', state: 'Rajasthan' },
  { name: 'Birla Institute of Technology and Science, Goa', shortName: 'BITS Goa', city: 'Goa', state: 'Goa' },
  { name: 'Birla Institute of Technology and Science, Hyderabad', shortName: 'BITS Hyderabad', city: 'Hyderabad', state: 'Telangana' },
  
  // Gujarat
  { name: 'Parul University', shortName: 'PU', city: 'Vadodara', state: 'Gujarat' },
  { name: 'Nirma University', shortName: 'NU', city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Dhirubhai Ambani Institute of Information and Communication Technology', shortName: 'DA-IICT', city: 'Gandhinagar', state: 'Gujarat' },
  { name: 'Pandit Deendayal Energy University', shortName: 'PDEU', city: 'Gandhinagar', state: 'Gujarat' },
  { name: 'Maharaja Sayajirao University of Baroda', shortName: 'MSU Baroda', city: 'Vadodara', state: 'Gujarat' },
  { name: 'LD College of Engineering', shortName: 'LDCE', city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Charotar University of Science and Technology', shortName: 'CHARUSAT', city: 'Anand', state: 'Gujarat' },
  { name: 'Dharmsinh Desai University', shortName: 'DDU', city: 'Nadiad', state: 'Gujarat' },

  // Maharashtra
  { name: 'College of Engineering, Pune', shortName: 'COEP', city: 'Pune', state: 'Maharashtra' },
  { name: 'Veermata Jijabai Technological Institute', shortName: 'VJTI', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Sardar Patel Institute of Technology', shortName: 'SPIT', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Pune Institute of Computer Technology', shortName: 'PICT', city: 'Pune', state: 'Maharashtra' },
  { name: 'Dwarkadas J. Sanghvi College of Engineering', shortName: 'DJSCE', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Walchand College of Engineering', shortName: 'WCE', city: 'Sangli', state: 'Maharashtra' },
  { name: 'Symbiosis Institute of Technology', shortName: 'SIT', city: 'Pune', state: 'Maharashtra' },

  // Karnataka
  { name: 'RV College of Engineering', shortName: 'RVCE', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'BMS College of Engineering', shortName: 'BMSCE', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'MS Ramaiah Institute of Technology', shortName: 'MSRIT', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'PES University', shortName: 'PESU', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'Manipal Institute of Technology', shortName: 'MIT Manipal', city: 'Manipal', state: 'Karnataka' },
  { name: 'The National Institute of Engineering', shortName: 'NIE', city: 'Mysuru', state: 'Karnataka' },

  // Tamil Nadu
  { name: 'Vellore Institute of Technology', shortName: 'VIT Vellore', city: 'Vellore', state: 'Tamil Nadu' },
  { name: 'SRM Institute of Science and Technology', shortName: 'SRM Chennai', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Anna University', shortName: 'Anna University', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'SSN College of Engineering', shortName: 'SSNCE', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'PSG College of Technology', shortName: 'PSGCT', city: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'Sathyabama Institute of Science and Technology', shortName: 'Sathyabama', city: 'Chennai', state: 'Tamil Nadu' },

  // Delhi & NCR
  { name: 'Delhi Technological University', shortName: 'DTU', city: 'New Delhi', state: 'Delhi' },
  { name: 'Netaji Subhas University of Technology', shortName: 'NSUT', city: 'New Delhi', state: 'Delhi' },
  { name: 'Indira Gandhi Delhi Technical University for Women', shortName: 'IGDTUW', city: 'New Delhi', state: 'Delhi' },
  { name: 'Maharaja Agrasen Institute of Technology', shortName: 'MAIT', city: 'New Delhi', state: 'Delhi' },
  { name: 'Amity University', shortName: 'Amity', city: 'Noida', state: 'Uttar Pradesh' },

  // Uttar Pradesh
  { name: 'Harcourt Butler Technical University', shortName: 'HBTU', city: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Institute of Engineering and Technology', shortName: 'IET Lucknow', city: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Madan Mohan Malaviya University of Technology', shortName: 'MMMUT', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { name: 'JSS Academy of Technical Education', shortName: 'JSSATE', city: 'Noida', state: 'Uttar Pradesh' },

  // West Bengal
  { name: 'Jadavpur University', shortName: 'JU Kolkata', city: 'Kolkata', state: 'West Bengal' },
  { name: 'Institute of Engineering and Management', shortName: 'IEM', city: 'Kolkata', state: 'West Bengal' },
  { name: 'Heritage Institute of Technology', shortName: 'HIT', city: 'Kolkata', state: 'West Bengal' },

  // Punjab & Chandigarh
  { name: 'Thapar Institute of Engineering and Technology', shortName: 'TIET', city: 'Patiala', state: 'Punjab' },
  { name: 'Punjab Engineering College', shortName: 'PEC', city: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Chandigarh University', shortName: 'CU', city: 'Mohali', state: 'Punjab' },
  { name: 'Lovely Professional University', shortName: 'LPU', city: 'Phagwara', state: 'Punjab' },

  // Madhya Pradesh
  { name: 'Shri Govindram Seksaria Institute of Technology and Science', shortName: 'SGSITS', city: 'Indore', state: 'Madhya Pradesh' },
  { name: 'Madhav Institute of Technology and Science', shortName: 'MITS', city: 'Gwalior', state: 'Madhya Pradesh' },

  // Rajasthan
  { name: 'LNMIIT', shortName: 'LNMIIT', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'MBM Engineering College', shortName: 'MBM', city: 'Jodhpur', state: 'Rajasthan' },

  // Kerala
  { name: 'College of Engineering Trivandrum', shortName: 'CET', city: 'Trivandrum', state: 'Kerala' },
  { name: 'TKM College of Engineering', shortName: 'TKM', city: 'Kollam', state: 'Kerala' },

  // Telangana & AP
  { name: 'Jawaharlal Nehru Technological University', shortName: 'JNTUH', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Chaitanya Bharathi Institute of Technology', shortName: 'CBIT', city: 'Hyderabad', state: 'Telangana' },
  { name: 'VNR Vignana Jyothi Institute of Engineering and Technology', shortName: 'VNR VJIET', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Vasavi College of Engineering', shortName: 'VCE', city: 'Hyderabad', state: 'Telangana' },

  // Odisha
  { name: 'Kalinga Institute of Industrial Technology', shortName: 'KIIT', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'College of Engineering and Technology', shortName: 'CET Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' }
];

const seedColleges = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in .env");
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    console.log('🎓 Seeding Top Indian Engineering Colleges...');

    let addedCount = 0;
    
    for (const college of topIndianColleges) {
      // Normalize name for unique comparison (lowercase, remove extra spaces and special chars)
      const normalizedName = college.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Check if already exists
      const existing = await University.findOne({ normalizedName });
      
      if (!existing) {
        await University.create({
          name: college.name,
          normalizedName,
          shortName: college.shortName,
          city: college.city,
          state: college.state,
          country: 'India',
          verified: true,
          createdBy: 'system'
        });
        console.log(`+ Added: ${college.name}`);
        addedCount++;
      } else {
        console.log(`- Skipped: ${college.name} (Already exists)`);
      }
    }

    console.log(`\n🎉 Success! Seeded ${addedCount} new colleges to the database.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding colleges:', error);
    process.exit(1);
  }
};

seedColleges();
