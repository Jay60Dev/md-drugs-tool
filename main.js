const jobsList = ["beanmachine","bestbudz","burgershot","deerdiner","fishnchips","hookies","hornys","limeys","morpheouspub","pizzeria","popsdiner","tacoshop","tequilala","uwucafe"];

class Item {
    constructor(name, data) {
        this.name = name;
        this.label = data.label || name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/^./, c => c.toUpperCase());
        this.weight = data.weight || 100;
        this.type = data.type || 'item';
        this.image = data.image || `${name}.png`;
        this.unique = data.unique || false;
        this.useable = data.useable || true;
        this.shouldClose = data.shouldClose || true;
        this.description = data.description || "";
    }

    toOx() {
        return `\t['${this.name}'] = {\n\t\tlabel = '${this.label}',\n\t\tdescription = '${this.description}',\n\t\tweight = ${this.weight},\n\t\tstack = ${this.stack},\n\t\tclose = ${this.close},\n\t\tclient = { image = '${this.image}' }\n\t},\n`;
    }

    toQb() {
        return `\t${this.name} = {name = '${this.name}', label = '${this.label}', weight = ${this.weight}, type = '${this.type}', image = '${this.image}', unique = ${this.unique}, useable = ${this.useable}, shouldClose = ${this.shouldClose}, description = '${this.description}'},\n`;
    }
}

class Job {
    constructor(name, data) {
        this.name = name;
        this.label = data.label;
        this.type = data.type;
        this.defaultDuty = data.defaultDuty;
        this.offDutyPay = data.offDutyPay;
        this.grades = data.grades;
        this.items = Object.entries(data.items || {}).map(([itemName, itemData]) => new Item(itemName, itemData));
    }

    toQb() {
        let str = `\t${this.name} = {\n\t\tlabel = '${this.label}',\n\t\ttype = '${this.type}',\n\t\tdefaultDuty = ${this.defaultDuty},\n\t\toffDutyPay = ${this.offDutyPay},\n\t\tgrades = {\n`;
        this.grades.forEach((grade, index) => {
            str += `\t\t\t['${index}'] = {\n\t\t\t\tname = '${grade.name}',\n\t\t\t\tpayment = ${grade.payment}\n`;
            if (grade.isboss) str += `\t\t\t\tisboss = true,\n`;
            if (grade.bankAuth) str += `\t\t\t\tbankAuth = true,\n`;
            str += `\t\t\t},\n`;
        });
        str += `\t\t}\n\t},\n`;
        return str;
    }

    toQbox() {
        let str = `\t['${this.name}'] = {\n\t\tlabel = '${this.label}',\n\t\ttype = '${this.type}',\n\t\tdefaultDuty = ${this.defaultDuty},\n\t\toffDutyPay = ${this.offDutyPay},\n\t\tgrades = {\n`;
        this.grades.forEach((grade, index) => {
            str += `\t\t\t[${index}] = {\n\t\t\t\tname = '${grade.name}',\n\t\t\t\tpayment = ${grade.payment}\n`;
            if (grade.isboss) str += `\t\t\t\tisboss = true,\n`;
            if (grade.bankAuth) str += `\t\t\t\tbankAuth = true,\n`;
            str += `\t\t\t},\n`;
        });
        str += `\t\t}\n\t},\n`;
        return str;
    }

    toEsx() {
        let str = `INSERT INTO \`jobs\` (name, label) VALUES\n\t('${this.name}', '${this.label}');\n`;
        str += `INSERT INTO \`job_grades\` (job_name, grade, name, label, salary, skin_male, skin_female) VALUES\n`;
        this.grades.forEach((grade, index) => {
            str += `\t('${this.name}', ${index}, '${grade.name}', '${grade.label || grade.name}', ${grade.payment}, '${grade.skin_male || '{}'}', '${grade.skin_female || '{}'}'),\n`;
        });
        return str.slice(0, -2) + ';\n';
    }

    getItems(inv) {
        if (inv === 'Qb') return this.items.map(i => i.toQb()).join('');
        if (inv === 'Ox') return this.items.map(i => i.toOx()).join('');
        return '';
    }

    getItemData(framework) {
        if (framework === 'Qb') return this.toQb();
        if (framework === 'Qbox') return this.toQbox();
        if (framework === 'Esx') return this.toEsx();
        return '';
    }

    generate(framework, inv) {
        return { jobs: this.getItemData(framework), items: this.getItems(inv) };
    }
}

// --- Checkbox generation ---
const jobsContainer = document.getElementById('jobs-checkboxes');
jobsList.forEach(job => {
    const wrapper = document.createElement('div');
    wrapper.className = 'job-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `job-${job}`;
    checkbox.value = job;

    const label = document.createElement('label');
    label.htmlFor = `job-${job}`;
    label.textContent = job.charAt(0).toUpperCase() + job.slice(1);

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    jobsContainer.appendChild(wrapper);
});

// --- Fetch JSON ---
async function fetchJobData(job) {
    const res = await fetch(`jobs/${job}.json`);
    if (!res.ok) throw new Error(`Failed to load ${job}.json`);
    return res.json();
}

// --- Generate button logic ---
const generateButton = document.getElementById('generate');
generateButton.onclick = async () => {
    const framework = document.getElementById('framework').value;
    const inventory = document.getElementById('inventory').value;

    const selectedJobs = Array.from(jobsContainer.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
    if (!selectedJobs.length) return alert('Please select at least one job.');

    const output = [];
    for (const job of selectedJobs) {
        const jobData = await fetchJobData(job);
        const jobInstance = new Job(job, jobData);
        output.push(jobInstance.generate(framework, inventory));
    }

    ["jobs", "items"].forEach(id => {
        const el = document.getElementById(`output-${id}`);
        el.textContent = output.map(o => o[id]).join('');
        el.classList.toggle('hidden', el.textContent === '');
    });
};
