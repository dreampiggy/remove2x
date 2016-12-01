'use strict';
const fs = require('fs');
const path = require('path');

const CONTENTS_JSON = 'Contents.json';

class Remove2x {
	constructor(entryPath, arg) {
		this.entryPath = path.join(__dirname, entryPath);
		this.opArg = arg;
	}
	
	start() {
		if (!fs.existsSync(this.entryPath)) {
			console.log('Path is not valid');
			return;
		}
		
		switch (this.opArg) {
			case undefined:
			case '--backup':
				console.log('Start Backup...');
				this.loadAndBackup(this.entryPath);
				break;
			case '--recovery':
				console.log('Start Recoivery...');
				this.loadAndRecovery(this.entryPath);
				break;
			case '--delete':
				console.log('Start Delete...');
				this.loadAndDelete(this.entryPath);
				break;
			default:
				console.log('Usage: node remove2x.js filepath [--backup] [--recovery] [--delete]');
				break;
		}
	}
	
	loadAndRecovery(basePath) {
		if (!basePath) return;
		
		if (!this.isFolder(basePath)) {
			return;
		}
		
		let files = fs.readdirSync(basePath);
		if (!files) return;
		
		files.forEach((file) => {
			let currentFile = path.join(basePath, file);
			if (this.checkPathEndsWith(currentFile, '.2xbak')) {
				console.log('Recovery: ' + currentFile);
				fs.renameSync(currentFile, currentFile.slice(0, -6));
			} else {
				this.loadAndRecovery(currentFile); // recursive load dirs
			}
		});
	}
	
	loadAndDelete(basePath) {
		if (!basePath) return;
		
		if (!this.isFolder(basePath)) {
			return;
		}
		
		let files = fs.readdirSync(basePath);
		if (!files) return;
		
		files.forEach((file) => {
			let currentFile = path.join(basePath, file);
			if (this.checkPathEndsWith(currentFile, '.2xbak')) {
				console.log('Delete: ' + currentFile);
				fs.unlinkSync(currentFile);
			} else {
				this.loadAndDelete(currentFile); // recursive load dirs
			}
		});
	}
	
	loadAndBackup(basePath) {
		if (!basePath) return;
		
		if (!this.isFolder(basePath)) {
			return;
		}
		
		let files = fs.readdirSync(basePath);
		if (!files) return;
		
		files.forEach((file) => {
			let currentFile = path.join(basePath, file);
			// if (this.isXCAssets(basePath) && this.isImageSet(currentFile)) // xcassets subfolder can contains imageset
			if (this.isImageSet(currentFile)) {
				let jsonPath = path.join(currentFile, CONTENTS_JSON);
				let image = this.imageNameOfJSON(jsonPath);
				if (!image) return;
				console.log(currentFile, image);
				this.backupFile(path.join(currentFile, image)); // backup image
			} else {
				this.loadAndBackup(currentFile); // recursive load dirs
			}
		});
	}
	
	isFolder(file) {
		if (!file) return false;
		if (!fs.existsSync(file)) return false;
		
		let stats = fs.statSync(file);
		return !stats.isFile();
	}
	
	isXCAssets(basePath) {
		if (!basePath) return false;
		if (!fs.existsSync(basePath)) return false;
		
		let assetsRegex = '.xcassets';
		return this.checkPathEndsWith(basePath, assetsRegex);
	}
	
	isImageSet(basePath) {
		if (!basePath) return false;
		if (!fs.existsSync(basePath)) return false;
		
		let imageSetRegex = '.imageset';
		if (this.checkPathEndsWith(basePath, imageSetRegex)) {
			let files = fs.readdirSync(basePath);
			return files.indexOf(CONTENTS_JSON) !== -1;
		}
	}
	
	imageNameOfJSON(jsonPath) {
		if (!jsonPath) return;
		
		try {
			let json = fs.readFileSync(jsonPath);
			let content = JSON.parse(json);
			let imageArr = content.images;
			let contains3xArr = imageArr.filter((v) => v['scale'] === '3x' && v['filename'] !== undefined);
			if (contains3xArr.length == 0) return; // no 3x, we cannot remove 2x iamge, return
			
			let filteredArr = imageArr.filter((v) => v['scale'] === '2x');

			if (filteredArr.length > 0) {
				let image2x = filteredArr[0];
				let image2xName = image2x['filename'];
				delete image2x['filename'];
				
				this.backupFile(jsonPath); // backup old Contents.json
				fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2)); // write back
				
				return image2xName;
			}
		} catch(err) {
			console.log(err);
		}
	}
	
	checkHadBackup(file) {
		if (!file) return false;
		
		let bakFile = file + '.2xbak';
		return fs.existsSync(bakFile);
	}
	
	checkPathEndsWith(str, suffix) {
		return (str.indexOf(suffix, str.length - suffix.length) !== -1) && (str.indexOf(suffix, str.length - suffix.length + 1));
	}
	
	backupFile(file) {
		if (this.checkHadBackup(file)) {
			return;
		}
		
		if (fs.existsSync(file)) {
			fs.renameSync(file, file + '.2xbak');
			console.log('Backup: ' + file + ' => ' + file + '.2xbak');	
		}
	}
}



if (!process.argv[2]) {
	console.log('Usage: node remove2x.js filepath [--backup] [--recovery] [--delete]');
	return;
}

let remove2x = new Remove2x(process.argv[2], process.argv[3]);
remove2x.start();
