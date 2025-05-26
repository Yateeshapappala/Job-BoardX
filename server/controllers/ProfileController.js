const Profile = require('../models/Profile');

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { headline, bio, phone, location, website, linkedin, github, skills, experience, education } = req.body;

    const profileFields = {
      user: userId,
      headline: headline || '',
      bio: bio || '',
      phone: phone || '',
      location: location || '',
      website: website || '',
      linkedin: linkedin || '',
      github: github || '',
      skills: Array.isArray(skills) ? skills : [],
      experience: Array.isArray(experience) ? experience : [],
      education: Array.isArray(education) ? education : [],
    };

    // ✅ Add avatar if uploaded
    if (req.file) {
      profileFields.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedProfile);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
