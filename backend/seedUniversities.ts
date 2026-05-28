import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { University } from './src/models/university.model';
import { Suggestion } from './src/models/suggestion.model';
import { normalizeUniversityName } from './src/controllers/university.controller';

dotenv.config();

const universitiesList = [
  "Indian Institute of Technology (IIT) Delhi",
  "Indian Institute of Technology (IIT) Bombay",
  "Indian Institute of Technology (IIT) Madras",
  "Indian Institute of Technology (IIT) Kanpur",
  "Indian Institute of Technology (IIT) Kharagpur",
  "Indian Institute of Technology (IIT) Roorkee",
  "Indian Institute of Technology (IIT) Guwahati",
  "Indian Institute of Technology (IIT) Hyderabad",
  "Indian Institute of Technology (IIT) Indore",
  "Indian Institute of Technology (IIT) BHU Varanasi",
  "Indian Institute of Technology (IIT) Ropar",
  "Indian Institute of Technology (IIT) Gandhinagar",
  "Indian Institute of Technology (IIT) Mandi",
  "Indian Institute of Technology (IIT) Jodhpur",
  "Indian Institute of Technology (IIT) Patna",
  "Indian Institute of Technology (IIT) Bhubaneswar",
  "Indian Institute of Technology (IIT) Tirupati",
  "Indian Institute of Technology (IIT) Palakkad",
  "Indian Institute of Technology (IIT) Jammu",
  "Indian Institute of Technology (IIT) Dharwad",
  "National Institute of Technology (NIT) Trichy",
  "National Institute of Technology (NIT) Surathkal",
  "National Institute of Technology (NIT) Warangal",
  "National Institute of Technology (NIT) Calicut",
  "National Institute of Technology (NIT) Rourkela",
  "National Institute of Technology (NIT) Allahabad",
  "National Institute of Technology (NIT) Kurukshetra",
  "National Institute of Technology (NIT) Jaipur",
  "National Institute of Technology (NIT) Nagpur",
  "National Institute of Technology (NIT) Durgapur",
  "National Institute of Technology (NIT) Silchar",
  "National Institute of Technology (NIT) Hamirpur",
  "National Institute of Technology (NIT) Jamshedpur",
  "National Institute of Technology (NIT) Patna",
  "National Institute of Technology (NIT) Bhopal",
  "National Institute of Technology (NIT) Delhi",
  "National Institute of Technology (NIT) Srinagar",
  "National Institute of Technology (NIT) Raipur",
  "National Institute of Technology (NIT) Agartala",
  "National Institute of Technology (NIT) Goa",
  "National Institute of Technology (NIT) Meghalaya",
  "Indian Institute of Information Technology (IIIT) Hyderabad",
  "Indian Institute of Information Technology (IIIT) Bangalore",
  "Indian Institute of Information Technology (IIIT) Delhi",
  "IIIT Allahabad",
  "IIIT Gwalior",
  "IIIT Lucknow",
  "IIIT Pune",
  "IIIT Kottayam",
  "IIIT Sri City",
  "IIIT Vadodara",
  "IIIT Guwahati",
  "IIIT Nagpur",
  "IIIT Ranchi",
  "IIIT Surat",
  "IIIT Una",
  "IIIT Bhagalpur",
  "IIIT Kota",
  "IIIT Dharwad",
  "IIIT Sonepat",
  "IIIT Bhopal",
  "Indian Institute of Science (IISc) Bangalore",
  "Indian Statistical Institute (ISI) Kolkata",
  "Indian Statistical Institute (ISI) Delhi",
  "Indian Statistical Institute (ISI) Bangalore",
  "Birla Institute of Technology and Science (BITS) Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "Jadavpur University",
  "Vellore Institute of Technology (VIT)",
  "Manipal Institute of Technology (MIT)",
  "Thapar Institute of Engineering and Technology",
  "PSG College of Technology",
  "College of Engineering Pune (COEP)",
  "RV College of Engineering",
  "PES University",
  "SRM Institute of Science and Technology",
  "Amrita Vishwa Vidyapeetham",
  "Anna University",
  "Jamia Millia Islamia",
  "Aligarh Muslim University",
  "University of Hyderabad",
  "Jawaharlal Nehru University",
  "Banaras Hindu University",
  "Shiv Nadar University",
  "Ashoka University",
  "OP Jindal Global University",
  "Indian Institute of Information Technology and Management Kerala",
  "Indian Institute of Space Science and Technology",
  "DAIICT Gandhinagar",
  "LNMIIT Jaipur",
  "MS Ramaiah Institute of Technology",
  "BMS College of Engineering",
  "Nirma University",
  "Sardar Patel Institute of Technology",
  "Veermata Jijabai Technological Institute (VJTI)",
  "Kalinga Institute of Industrial Technology (KIIT)",
  "Government Engineering College Barton Hill",
  "Government Engineering College Thrissur",
  "Government College of Engineering Karad",
  "Government College of Engineering Aurangabad",
  "Government Engineering College Kozhikode",
  "University Institute of Engineering and Technology Kanpur",
  "Guru Gobind Singh Indraprastha University",
  "Punjab Engineering College Chandigarh",
  "YMCA Faridabad",
  "MNNIT Allahabad",
  "HBTU Kanpur",
  "Maharaja Sayajirao University of Baroda (MSU Baroda)",
  "Faculty of Technology and Engineering MSU Baroda",
  "Parul University Vadodara",
  "Parul Institute of Engineering and Technology",
  "Navrachana University Vadodara",
  "Sigma University Vadodara",
  "ITM Vocational University Vadodara",
  "GSFC University Vadodara",
  "Sumandeep Vidyapeeth Vadodara",
  "BITS Edu Campus Vadodara",
  "Government Engineering College Vadodara",
  "Vadodara Institute of Engineering",
  "Babu Madhav Institute of Information Technology",
  "Laxmi Institute of Technology Vadodara",
  "Aaditya Silver Oak Institute Vadodara",
  "Indus University Vadodara Campus",
  "R.K. University Vadodara Campus",
  "New Vallabh Vidyanagar Engineering College Vadodara"
];

const branchesList = [
  "Computer Science",
  "Computer Science Engineering",
  "Computer Science & Engineering",
  "Information Technology",
  "Software Engineering",
  "Artificial Intelligence",
  "Artificial Intelligence & Machine Learning",
  "Machine Learning",
  "Data Science",
  "Cyber Security",
  "Cloud Computing",
  "Blockchain Technology",
  "Internet of Things",
  "Full Stack Development",
  "Web Development",
  "Mobile App Development",
  "DevOps",
  "Cloud Engineering",
  "Site Reliability Engineering",
  "Computer Networking",
  "Network Security",
  "Information Security",
  "Ethical Hacking",
  "Big Data Analytics",
  "Business Analytics",
  "Embedded Systems",
  "VLSI Design",
  "Robotics Engineering",
  "Automation Engineering",
  "Electronics & Communication",
  "Electrical Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Biomedical Engineering",
  "Aerospace Engineering",
  "Aeronautical Engineering",
  "Automobile Engineering",
  "Industrial Engineering",
  "Production Engineering",
  "Mining Engineering",
  "Petroleum Engineering",
  "Agricultural Engineering",
  "Environmental Engineering",
  "Textile Engineering",
  "Food Technology",
  "Instrumentation Engineering",
  "Mechatronics Engineering",
  "Structural Engineering",
  "Construction Engineering",
  "Game Development",
  "AR/VR Engineering",
  "UI/UX Design",
  "Human Computer Interaction",
  "Quantum Computing",
  "Computational Science",
  "Digital Systems",
  "Multimedia Technology",
  "Animation & Gaming",
  "Digital Forensics",
  "Bioinformatics",
  "Computational Biology",
  "Enterprise Systems",
  "Distributed Systems",
  "Parallel Computing",
  "High Performance Computing",
  "Edge Computing",
  "FinTech Engineering",
  "HealthTech Engineering",
  "EdTech Systems",
  "E-Commerce Technology",
  "Smart Systems Engineering",
  "Intelligent Systems"
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codeyx';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to Database');

    let uniAddedCount = 0;
    let uniSkippedCount = 0;
    let branchAddedCount = 0;
    let branchSkippedCount = 0;

    console.log('\n--- Seeding Universities ---');
    for (const name of universitiesList) {
      const normalizedName = normalizeUniversityName(name);

      const exists = await University.findOne({ normalizedName });
      if (!exists) {
        await University.create({
          name,
          normalizedName,
          country: 'India',
          verified: true, // Auto verified because it's a seed
        });
        uniAddedCount++;
        console.log(`Added: ${name}`);
      } else {
        uniSkippedCount++;
        // console.log(`Skipped (Already exists): ${name}`);
      }
    }

    console.log('\n--- Seeding Branches ---');
    for (const name of branchesList) {
      const normalizedName = normalizeUniversityName(name);

      const exists = await Suggestion.findOne({ category: 'branch', normalizedName });
      if (!exists) {
        await Suggestion.create({
          category: 'branch',
          name,
          normalizedName,
          verified: true, // Master data is verified
          createdBy: 'system'
        });
        branchAddedCount++;
        console.log(`Added Branch: ${name}`);
      } else {
        branchSkippedCount++;
      }
    }

    console.log(`\n✅ Seeding Complete!`);
    console.log(`Universities Added: ${uniAddedCount} | Skipped: ${uniSkippedCount}`);
    console.log(`Branches Added: ${branchAddedCount} | Skipped: ${branchSkippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
