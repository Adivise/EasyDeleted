const fs = require('fs');
const path = require('path');

const { bmMode, songsFolder } = require('./config.js');

// Scan the entire songs folder
fs.readdir(songsFolder, (err, beatmapFolders) => {
    if (err) {
        console.error('Error reading songs folder:', err);
        return;
    }

    // Iterate through each beatmap folder
    beatmapFolders.forEach(beatmapFolder => {
    const beatmapFolderPath = path.join(songsFolder, beatmapFolder);

      // Check if the beatmap folder is a directory
    if (fs.statSync(beatmapFolderPath).isDirectory()) {
        // Read the content of the .osu files in the beatmap folder
        fs.readdir(beatmapFolderPath, (err, osuFiles) => {
        if (err) {
            console.error(`Error reading files in ${beatmapFolder} folder:`, err);
            return;
        }

        // Filter out only .osu files
        osuFiles = osuFiles.filter(file => file.endsWith('.osu'));

        // Check if there are any .osu files before proceeding
        if (osuFiles.length === 0) {
            console.log(`No .osu files found in beatmap folder '${beatmapFolder}'.`);
            return;
        }

        // Iterate through each .osu file in the beatmap folder
        osuFiles.forEach(osuFile => {
            const osuFilePath = path.join(beatmapFolderPath, osuFile);

            // Check if the .osu file exists before attempting to read it
            if (fs.existsSync(osuFilePath)) {
            // Read the content of the .osu file
            const osuFileContent = fs.readFileSync(osuFilePath, 'utf-8');

            // Process the content of the .osu file
            const modeValue = parseModeFromOsuFile(osuFileContent);

            // Delete the beatmap folder if Mode is ??
            if (bmMode.includes(modeValue)) {
                deleteFolder(beatmapFolderPath);
            }

            } else {
                // console.log(`Warning: .osu file not found for '${osuFile}' in beatmap folder '${beatmapFolder}'.`);
                }
            });
        });
        }
    });
});

function parseModeFromOsuFile(content) {
    const lines = content.split('\n');
    let inSection = false;

    for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('[General]')) {
            inSection = true;
        } else if (inSection && line.startsWith('[')) {
            // If the line starts with '[' but is not our section, stop parsing
            inSection = false;
            break;
        } else if (inSection) {
            // Example: Assuming each line has a key-value pair separated by colon
            const [key, value] = line.split(':');
        if (key && value && key.trim() === 'Mode') {
            return value.trim();
            }
        }
    }
    return null; // Return null if Mode property is not found
}

function deleteFolder(folderPath) {
    try {
        fs.rmSync(folderPath, { recursive: true });
        console.log(`Deleted beatmap '${folderPath}'`);
    } catch (error) {
        console.error(`Error deleting beatmap folder '${folderPath}':`, error);
    }
}