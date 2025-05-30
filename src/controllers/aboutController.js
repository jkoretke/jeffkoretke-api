// About controller - handles about me information requests
// Similar to how you'd handle static data in Android (like displaying user profile info)

/**
 * Get about me information
 * Returns comprehensive about me data for the website
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAboutInfo = (req, res) => {
    try {
        // Static about me data (like storing profile data in Android SharedPreferences or a data class)
        const aboutData = {
            name: "Jeff Koretke",
            title: "Android Developer",
            bio: "Experienced Android developer with expertise in Kotlin, MVI, MVVM and clean architecture, and modern Android development practices. Passionate about creating intuitive user experiences and writing clean, maintainable code.",
            location: "San Diego, California, United States",
            email: "jeff@jeffkoretke.com",
            resume: "/files/jeff-koretke-resume.pdf",
            profileImage: "/images/jeff-koretke-profile.jpg",
            
            // Technical skills grouped by category
            skills: {
                languages: [
                    "Kotlin",
                    "Java", 
                    "JavaScript",
                    "Python",
                    "C",
                    "C++"
                ],
                mobile: [
                    "Android SDK",
                    "Jetpack Compose",
                    "MVVM Architecture",
                    "MVI Architecture",
                    "Clean Architecture",
                    "Coroutines",
                    "Flow",
                    "LiveData",
                    "Retrofit",
                    "Room Database",
                    "Dagger/Hilt",
                ],
                backend: [
                    "Node.js",
                    "Express.js",
                    "REST APIs",
                    "SQL"
                ],
                tools: [
                    "Git",
                    "Android Studio",
                    "VS Code",
                    "Figma",
                    "Postman",
                    "Firebase"
                ],
                methodologies: [
                    "Agile/Scrum",
                    "Test-Driven Development",
                    "Clean Architecture",
                    "CI/CD"
                ]
            },
            
            // Professional experience
            experience: [
                {
                    company: "Accesso Technology Group",
                    position: "Mobile Engineer",
                    duration: "2018 - Present",
                    description: "Android application development using Kotlin and Jetpack Compose. Implemented MVI architecture and modern Android development practices.",
                    achievements: [
                        "Increased app performance by 40% through optimization",
                        "Led migration from Java to Kotlin",
                        "Implemented automated testing reducing bugs by 60%"
                    ]
                },
                {
                    company: "GreatCall (now Lively)",
                    position: "Android Developer - Intern",
                    duration: "2017",
                    description: "Developed a healthcare app for seniors, focusing on user-friendly design and accessibility features.",
                    achievements: [
                        "Built Movement tracking feature using machine learning",
                        "Improved app accessibility for seniors",
        
                    ]
                }
            ],
            
            // Education background
            education: [
                {
                    institution: "University of California, San Diego",
                    degree: "Bachelor's in Mathematics-Computer Science",
                    duration: "2015 - 2018",
                    description: "Focused on software engineering, algorithms, and data structures. Developed strong problem-solving skills."
                }
            ],
            
            // Social links
            socialLinks: {
                github: "https://github.com/jkoretke",
                linkedin: "https://linkedin.com/in/jeffkoretke",
                portfolio: "https://jeffkoretke.com"
            },
            
            // Interests and hobbies
            interests: [
                "Mobile App Development",
                "Web Development",
                "Guitar Playing",
                "Music Festival Enthusiast",
                "Gaming"
            ],
            
            // Current status
            availability: {
                status: "Employed - Not actively looking",
                preferredRoles: ["Senior Android Developer", "Mobile Team Lead", "Android Architect"],
                remoteWork: true,
                relocation: false
            },
            
            // Fun facts
            funFacts: [
                "Built my first Android app in college",
                "Music lover with a passion for guitar",
                "Attended countless music festivals",
                "Loves solving complex challenges"
            ]
        };

        // Log the request (like Android's Log.i())
        console.log(`📋 About info requested from ${req.ip || 'unknown IP'}`);

        // Return successful response
        res.json({
            success: true,
            data: aboutData,
            lastUpdated: new Date().toISOString(),
            message: "About information retrieved successfully"
        });

    } catch (error) {
        console.error('❌ Error fetching about information:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching about information',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAboutInfo
};
