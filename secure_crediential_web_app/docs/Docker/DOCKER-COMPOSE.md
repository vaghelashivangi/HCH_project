# **Installing Docker Compose on Ubuntu**  

To install Docker Compose on Ubuntu, follow these steps:  

### **1⃣ Install Docker Compose**  
```bash
sudo apt update
sudo apt install docker-compose-plugin -y
```

### **2⃣ Verify Installation**  
```bash
docker compose version
```

---

# **Running Docker Compose**  

### **1⃣ Navigate to Your Project Directory**  
```bash
cd /path/to/your/project
```

### **2⃣ Build and Start Services**  
```bash
sudo docker compose up -d --build
```
- `-d` → Runs in detached mode (background).  
- `--build` → Rebuilds containers from the latest code.  

### **3⃣ List Running Services**  
```bash
sudo docker compose ps
```

### **4⃣ Stop and Remove Containers**  
```bash
sudo docker compose down
```
- Stops and removes all running containers.  

### **5⃣ View Logs of a Specific Service**  
```bash
sudo docker compose logs -f <service_name>
```
- `-f` → Follows the logs in real-time.  

### **6⃣ Restart All Services**  
```bash
sudo docker compose restart
```

### **7⃣ Execute a Command Inside a Running Container**  
```bash
sudo docker compose exec <service_name> bash
```
- Opens a shell inside the container for debugging.  

### **8⃣ List All Containers (Even Stopped Ones)**  
```bash
sudo docker compose ps -a
```

---
