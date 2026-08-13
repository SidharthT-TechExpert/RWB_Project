export interface LocationSuggestionItem {
  city: string;
  district?: string;
  state: string;
  country: string;
  subtitle?: string;
  display: string;
}

export function cleanPlaceName(rawName: string): string {
  if (!rawName) return '';
  return rawName
    .replace(
      /,?\s*(Central Upper Primary|Lower Primary|Upper Primary|Primary School|LP School|UP School|School|Anganavadi|Anganwadi|Hospital|Junction|Bus Stand|Sub Post Office).*$/i,
      ''
    )
    .trim() || rawName;
}

export const popularLocations: LocationSuggestionItem[] = [
  // Malappuram District & Towns
  { city: 'Malappuram', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Malappuram, Kerala' },
  { city: 'Vengara', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Vengara, Malappuram, Kerala' },
  { city: 'Kakkancheri', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Kinfra Tech Park Zone, Malappuram, Kerala', display: 'Kakkancheri, Malappuram, Kerala' },
  { city: 'Chelari', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Chelari, Malappuram, Kerala' },
  { city: 'Manjeri', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Manjeri, Malappuram, Kerala' },
  { city: 'Perinthalmanna', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Perinthalmanna, Malappuram, Kerala' },
  { city: 'Tirur', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Tirur, Malappuram, Kerala' },
  { city: 'Kottakkal', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Kottakkal, Malappuram, Kerala' },
  { city: 'Edappal', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Edappal, Malappuram, Kerala' },
  { city: 'Ponnani', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Ponnani, Malappuram, Kerala' },
  { city: 'Nilambur', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Nilambur, Malappuram, Kerala' },
  { city: 'Kondotty', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Calicut Airport Zone, Malappuram, Kerala', display: 'Kondotty, Malappuram, Kerala' },
  { city: 'Valanchery', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Valanchery, Malappuram, Kerala' },
  { city: 'Tirurangadi', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Tirurangadi, Malappuram, Kerala' },
  { city: 'Parappanangadi', district: 'Malappuram', state: 'Kerala', country: 'India', subtitle: 'Malappuram District, Kerala', display: 'Parappanangadi, Malappuram, Kerala' },

  // Kannur District & Towns
  { city: 'Kannur', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur District, Kerala', display: 'Kannur, Kerala' },
  { city: 'Mooriyad', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kuthuparamba / Kannur District, Kerala', display: 'Mooriyad, Kannur, Kerala' },
  { city: 'Vengara (Madayi)', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Madayi, Kannur District, Kerala', display: 'Vengara, Kannur, Kerala' },
  { city: 'Kuthuparamba', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur District, Kerala', display: 'Kuthuparamba, Kannur, Kerala' },
  { city: 'Thalassery', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur District, Kerala', display: 'Thalassery, Kannur, Kerala' },
  { city: 'Payyanur', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur District, Kerala', display: 'Payyanur, Kannur, Kerala' },
  { city: 'Mattannur', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur Airport Zone, Kerala', display: 'Mattannur, Kannur, Kerala' },
  { city: 'Taliparamba', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur District, Kerala', display: 'Taliparamba, Kannur, Kerala' },
  { city: 'Iritty', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur District, Kerala', display: 'Iritty, Kannur, Kerala' },
  { city: 'Pappinisseri', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur District, Kerala', display: 'Pappinisseri, Kannur, Kerala' },
  { city: 'Sreekandapuram', district: 'Kannur', state: 'Kerala', country: 'India', subtitle: 'Kannur District, Kerala', display: 'Sreekandapuram, Kannur, Kerala' },

  // Kozhikode District & Towns
  { city: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', country: 'India', subtitle: 'Calicut, Kerala', display: 'Kozhikode (Calicut), Kerala' },
  { city: 'Mooriyad', district: 'Kozhikode', state: 'Kerala', country: 'India', subtitle: 'Kozhikode City, Kerala', display: 'Mooriyad, Kozhikode, Kerala' },
  { city: 'Vadakara', district: 'Kozhikode', state: 'Kerala', country: 'India', subtitle: 'Kozhikode District, Kerala', display: 'Vadakara, Kozhikode, Kerala' },
  { city: 'Koyilandy', district: 'Kozhikode', state: 'Kerala', country: 'India', subtitle: 'Kozhikode District, Kerala', display: 'Koyilandy, Kozhikode, Kerala' },
  { city: 'Feroke', district: 'Kozhikode', state: 'Kerala', country: 'India', subtitle: 'Kozhikode District, Kerala', display: 'Feroke, Kozhikode, Kerala' },
  { city: 'Ramanattukara', district: 'Kozhikode', state: 'Kerala', country: 'India', subtitle: 'Kozhikode District, Kerala', display: 'Ramanattukara, Kozhikode, Kerala' },
  { city: 'Thamarassery', district: 'Kozhikode', state: 'Kerala', country: 'India', subtitle: 'Kozhikode District, Kerala', display: 'Thamarassery, Kozhikode, Kerala' },

  // Ernakulam / Kochi & Towns
  { city: 'Kochi', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Ernakulam, Kerala', display: 'Kochi (Cochin), Kerala' },
  { city: 'Ernakulam', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Ernakulam District, Kerala', display: 'Ernakulam, Kochi, Kerala' },
  { city: 'Kakkanad', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'InfoPark, Kochi, Kerala', display: 'Kakkanad, Kochi, Kerala' },
  { city: 'Aluva', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Kochi, Kerala', display: 'Aluva, Kochi, Kerala' },
  { city: 'Fort Kochi', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Heritage Zone, Kochi, Kerala', display: 'Fort Kochi, Kerala' },
  { city: 'Edappally', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Lulu Mall Zone, Kochi, Kerala', display: 'Edappally, Kochi, Kerala' },
  { city: 'Tripunithura', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Kochi, Kerala', display: 'Tripunithura, Kochi, Kerala' },
  { city: 'Angamaly', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Kochi Airport Zone, Kerala', display: 'Angamaly, Kochi, Kerala' },
  { city: 'Perumbavoor', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Ernakulam District, Kerala', display: 'Perumbavoor, Kochi, Kerala' },
  { city: 'Muvattupuzha', district: 'Ernakulam', state: 'Kerala', country: 'India', subtitle: 'Ernakulam District, Kerala', display: 'Muvattupuzha, Kochi, Kerala' },

  // Thrissur & Towns
  { city: 'Thrissur', district: 'Thrissur', state: 'Kerala', country: 'India', subtitle: 'Thrissur District, Kerala', display: 'Thrissur, Kerala' },
  { city: 'Guruvayur', district: 'Thrissur', state: 'Kerala', country: 'India', subtitle: 'Thrissur District, Kerala', display: 'Guruvayur, Thrissur, Kerala' },
  { city: 'Chalakudy', district: 'Thrissur', state: 'Kerala', country: 'India', subtitle: 'Thrissur District, Kerala', display: 'Chalakudy, Thrissur, Kerala' },
  { city: 'Kodungallur', district: 'Thrissur', state: 'Kerala', country: 'India', subtitle: 'Thrissur District, Kerala', display: 'Kodungallur, Thrissur, Kerala' },
  { city: 'Kunnamkulam', district: 'Thrissur', state: 'Kerala', country: 'India', subtitle: 'Thrissur District, Kerala', display: 'Kunnamkulam, Thrissur, Kerala' },

  // Palakkad & Towns
  { city: 'Palakkad', district: 'Palakkad', state: 'Kerala', country: 'India', subtitle: 'Palakkad District, Kerala', display: 'Palakkad, Kerala' },
  { city: 'Ottapalam', district: 'Palakkad', state: 'Kerala', country: 'India', subtitle: 'Palakkad District, Kerala', display: 'Ottapalam, Palakkad, Kerala' },
  { city: 'Shornur', district: 'Palakkad', state: 'Kerala', country: 'India', subtitle: 'Palakkad District, Kerala', display: 'Shornur, Palakkad, Kerala' },
  { city: 'Mannarkkad', district: 'Palakkad', state: 'Kerala', country: 'India', subtitle: 'Palakkad District, Kerala', display: 'Mannarkkad, Palakkad, Kerala' },

  // Wayanad & Towns
  { city: 'Wayanad', district: 'Wayanad', state: 'Kerala', country: 'India', subtitle: 'Wayanad District, Kerala', display: 'Wayanad, Kerala' },
  { city: 'Kalpetta', district: 'Wayanad', state: 'Kerala', country: 'India', subtitle: 'Wayanad District, Kerala', display: 'Kalpetta, Wayanad, Kerala' },
  { city: 'Sulthan Bathery', district: 'Wayanad', state: 'Kerala', country: 'India', subtitle: 'Wayanad District, Kerala', display: 'Sulthan Bathery, Wayanad, Kerala' },
  { city: 'Mananthavady', district: 'Wayanad', state: 'Kerala', country: 'India', subtitle: 'Mananthavady, Wayanad, Kerala', display: 'Mananthavady, Wayanad, Kerala' },

  // Kasaragod & Towns
  { city: 'Kasaragod', district: 'Kasaragod', state: 'Kerala', country: 'India', subtitle: 'Kasaragod District, Kerala', display: 'Kasaragod, Kerala' },
  { city: 'Kanhangad', district: 'Kasaragod', state: 'Kerala', country: 'India', subtitle: 'Kasaragod District, Kerala', display: 'Kanhangad, Kasaragod, Kerala' },
  { city: 'Nileshwaram', district: 'Kasaragod', state: 'Kerala', country: 'India', subtitle: 'Kasaragod District, Kerala', display: 'Nileshwaram, Kasaragod, Kerala' },

  // South Kerala
  { city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', country: 'India', subtitle: 'Capital City, Kerala', display: 'Thiruvananthapuram, Kerala' },
  { city: 'Kazhakkoottam', district: 'Thiruvananthapuram', state: 'Kerala', country: 'India', subtitle: 'Technopark Zone, Trivandrum, Kerala', display: 'Kazhakkoottam, Trivandrum, Kerala' },
  { city: 'Kovalam', district: 'Thiruvananthapuram', state: 'Kerala', country: 'India', subtitle: 'Beach Zone, Trivandrum, Kerala', display: 'Kovalam, Trivandrum, Kerala' },
  { city: 'Kollam', district: 'Kollam', state: 'Kerala', country: 'India', subtitle: 'Kollam District, Kerala', display: 'Kollam, Kerala' },
  { city: 'Alappuzha', district: 'Alappuzha', state: 'Kerala', country: 'India', subtitle: 'Alleppey, Kerala', display: 'Alappuzha, Kerala' },
  { city: 'Kottayam', district: 'Kottayam', state: 'Kerala', country: 'India', subtitle: 'Kottayam District, Kerala', display: 'Kottayam, Kerala' },
  { city: 'Munnar', district: 'Idukki', state: 'Kerala', country: 'India', subtitle: 'Hill Station, Idukki, Kerala', display: 'Munnar, Idukki, Kerala' },

  // National & International Hubs
  { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', subtitle: 'Karnataka, India', display: 'Bengaluru, Karnataka' },
  { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', country: 'India', subtitle: 'Maharashtra, India', display: 'Mumbai, Maharashtra' },
  { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India', subtitle: 'Tamil Nadu, India', display: 'Chennai, Tamil Nadu' },
  { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', subtitle: 'Telangana, India', display: 'Hyderabad, Telangana' },
  { city: 'Delhi NCR', district: 'Delhi', state: 'Delhi', country: 'India', subtitle: 'National Capital Region, India', display: 'Delhi NCR, India' },
  { city: 'Dubai', district: 'Dubai', state: 'Dubai', country: 'UAE', subtitle: 'United Arab Emirates', display: 'Dubai, UAE' },
  { city: 'New York', district: 'Manhattan', state: 'NY', country: 'USA', subtitle: 'New York, USA', display: 'New York, NY' },
];
