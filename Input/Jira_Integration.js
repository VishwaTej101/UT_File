var jira_Int = function jira_Int(){

const axios = require('axios');
const fs = require('fs');
const xmlbuilder = require('xmlbuilder'); // Ensure you have the 'xmlbuilder' package installed

class GetIssues {
    constructor() {
        this.jira_endpoint = "https://datavaluetest.atlassian.net/rest/api/3/search";
        this.jira_email = "viswateja030@gmail.com";
        this.jira_token = "ATATT3xFfGF01w45IXf0ZU3Mx7QyFnaHpg5IU4xzCbCjE6tWhaWibUnioZHWJQR2UaxfHcJvBY9qFLF2l5CDxtq_ySnEkvW5475Rgu8zcF3EXdJFjU1hflxQOEqmwgwhrmW7GbAigAIXVA31Rs1AoJHNB92of55t9WpqytVyIBvBVPqmYklqUtg=1A230D6C";
        this.auth = {
            username: this.jira_email,
            password: this.jira_token,
        };
        this.headers = {
            'Accept': 'application/json',
        };
        this.query = {
            'jql': 'created >= -30d AND project = ATDP2 AND status in ("In Progress", "To Do") ORDER BY cf[10034] DESC, priority DESC, created DESC',
        };
    }

    async api_call() {
        try {
            const response = await axios.get(this.jira_endpoint, {
                params: this.query,
                auth: this.auth,
                headers: this.headers,
            });
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    // Filter and format issue data
    data_filter(data) {
        const defect_data = [];
        let android_count = 0;
        let ios_count = 0;

        if ("issues" in data) {
            for (const issue of data["issues"]) {
                const project = issue["fields"]["project"]["name"];
                const priority = issue["fields"]["priority"]["name"];
                const description = this.removeUnnecessaryKeys(issue["fields"]["description"]);

                if (project.includes("Android")) {
                    android_count += 1;
                }
                if (project.includes("iOS")) {
                    ios_count += 1;
                }

                defect_data.push({
                    "Project Name": project,
                    "Priority": priority,
                    "Description": description,
                });
            }
        }

        return defect_data;
    }

    // Function to remove unnecessary keys
    removeUnnecessaryKeys(obj) {
        if (typeof obj === 'object' && obj !== null) {
            const result = {};
            for (const key in obj) {
                if (key !== 'version' && key !== 'type') {
                    result[key] = this.removeUnnecessaryKeys(obj[key]);
                }
            }
            return result;
        } else {
            return obj;
        }
    }

    // Print filtered data
    print_data(defect_data, android_count, ios_count) {
        // Create .txt file
        let txtData = '';
        defect_data.forEach(issue => {
            txtData += `
Description: ${this.getDescription(issue['Description'])}
Priority: ${issue['Priority']}

            `;
        });

        fs.writeFileSync("defect_report.txt", txtData);

        // Create .xml file
        const xmlData = xmlbuilder.create('defects');
        defect_data.forEach(issue => {
            const defect = xmlData.ele('defect');
            defect.ele('ProjectName', issue['Project Name']);
            defect.ele('Priority', issue['Priority']);
            
            defect.ele('Description', this.getDescription(issue['Description']));
           
        });
        fs.writeFileSync("defect_report.xml", xmlData.end({ pretty: true }));
    }

    // Helper method to format description
    getDescription(description) {
        let formattedDescription = '';
        const traverseDescription = (obj) => {
            if (typeof obj === 'object') {
                for (const key in obj) {
                    if (key === 'text' && obj[key]) {
                        formattedDescription += obj[key] + ' ';
                    } else {
                        traverseDescription(obj[key]);
                    }
                }
            }
        };
        traverseDescription(description);
        return formattedDescription.trim();
    }

    async data_print_and_store() {
        const data = await this.api_call();
        if (data === null) {
            console.log("No issues found.");
            return;
        }

        const defect_data = this.data_filter(data);
        this.print_data(defect_data, 0, 0); // Print defect data
    }
}

// Uncomment this block to run the code
(async () => {
    const getIssues = new GetIssues();
    await getIssues.data_print_and_store();
})();

}

module.exports.jira_Int = jira_Int;