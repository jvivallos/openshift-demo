package cl.udec.spring.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "demo")
public class DemoController {

    @GetMapping(value = "{persona}")
    public String pruebaDeServicio(@PathVariable String persona) {
        return "Saludos " + persona;
    }
}
