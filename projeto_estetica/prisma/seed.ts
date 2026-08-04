// Lê o current-data.json de forma segura com tipagem explícita
  let adminData: {
    services: Array<{ id: string; title: string; description: string; image: string; value: number }>
    videos: Array<{ id: string; title: string; instagramUrl: string }>
    reviews: Array<{ id: string; name: string; rating: number; text: string }>
  } = { services: [], videos: [], reviews: [] }

  const jsonPath = path.join(__dirname, '../current-data.json')
  
  if (fs.existsSync(jsonPath)) {
    const fileContent = fs.readFileSync(jsonPath, 'utf-8')
    adminData = JSON.parse(fileContent)
    console.log('Loaded data from current-data.json successfully.')
  } else {
    console.log('current-data.json not found, skipping data arrays seed.')
  }
