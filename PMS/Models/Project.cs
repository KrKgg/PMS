﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMS.Models
{
    public class Project
    {
        public int ProjectId { get; set; }
        public string ProjectCode { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public string Desciption { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<Group> Group { get; set; }
    }
}
