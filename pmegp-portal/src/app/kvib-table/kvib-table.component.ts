import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Trainee {
  id?: number; 
  trainee_id: number;
  name: string;
  batch_id: number;
  batch_year: number;
  dob: string;
  gender: string;
  father_spouse_name: string;
  category: string;
  tel_no: string;
  religion: string;
  address: string;
  email: string;
}

@Component({
  selector: 'app-kvib-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kvib-table.component.html',
  styleUrl: './kvib-table.component.css'
})
export class KvibTableComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  
  trainees: Trainee[] = []; 
  
  currentPage: number = 1;
  pageSize: number = 100; 

  
}