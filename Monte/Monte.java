/*
=======================================================================
   Monte.java
=======================================================================

    This java applet demonstrates three algorithm on Ising model :
   Metropolis's method[1], Swendsen and Wang's algorithm[2], Wolff's
   algorithm[3].

    Metropolis's algorithm is called single spin flip algorithm. SW
   and Wolff's algorithm is called cluster algorithm. Cluster
   algorithm can dramatically reduce the effects of critical slowing
   down and have been applied for many models.

   [1] N.Metropolis, A.W.Rosenbluth,M.N.Rosenbluth,A.H.Teller,E.Teller,
   J.Chem.Phys. 21,1087 (1953).
   [2] R.H.Swendsen and J.-S.Wang, Phys.Rev.Lett. 58, 86 (1987).
   [3] U.Wolff, Phys.Rev.Lett. 62,361 (1989).

=======================================================================

   Monte.java    Version 1.1
   Copyright (C) 1996  Kenji HARADA

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

   April 12, 1996
   (I corrected my code at June 24, 1999. Thank G. Pruessner.)

   Kenji HARADA
   Dep. of Applied Analysis and Complex Dynamical Systems,
   Graduate School of Infomatics, Kyoto University,
   Sakyo-ku, Kyoto 606-8501, Japan
   e-mail: harada@i.kyoto-u.ac.jp
   home-page: http://www-fcs.acs.i.kyoto-u.ac.jp/~harada/

*/

import java.applet.Applet;
import java.awt.*;
import java.util.*;

public class Monte extends Applet implements Runnable
{
  Label l;
  Panel p;
  Thread monte;
  Matter m;

  boolean stopped = false;
  int mode = 0;
  int n=32;
  int timeout = 5;

  String algorithmName[] = {"Metropolis's algorithm","Swendsen and Wang's algorithm","Wolff's algorithm"};

    String param;
    Color bg_color;

  public void init()
    {
      param = getParameter("bg_color");
      if(param == null){
	  bg_color=(Color.white);
	  setBackground(bg_color);
      }else{
	  String Red,Green,Blue;
	  int r,g,b;
	  Red = param.substring(0,2);
	  Green = param.substring(2,4);
	  Blue = param.substring(4);
	  r = Integer.valueOf(Red,16).intValue();
	  g = Integer.valueOf(Green,16).intValue();
	  b = Integer.valueOf(Blue,16).intValue();
	  bg_color = (new Color(r,g,b));
      }
      setBackground(bg_color);

      setLayout(new BorderLayout());
      p = new Panel();
      m = new Matter(n);
      m.mode=mode;
      add("Center",m);
      l = new Label(algorithmName[mode],Label.CENTER);
      add("North",l);
      add("South",p);
      p.add(new Button("Change"));
      p.add(new Button("Run"));
      p.add(new Button("Stop"));
      p.add(new Button("Step"));

    }

  public void start()
    {
      if(!stopped)
	{
	  monte=new Thread(this);
	  monte.start();
	}
    }

  public void stop() {
    if (monte.isAlive()) {
      monte.stop();
      stopped=true;
    }
  }

  public void run()
    {
      while(monte.isAlive())
	{
	  m.step();
	  repaint();
	  try{
	    Thread.sleep(timeout);
	  }
	  catch
	    (InterruptedException e) {}
	}
    }

  public void paint(Graphics g)
    {
      m.paint(m.getGraphics());
    }

  public void update(Graphics g)
    {
      m.repaint();
    }

  public boolean action(Event evt, Object arg) 
    {
      if("Step".equals(arg))
	{
	  m.step();
	  m.paintBoard(m.getGraphics());
	}
      else if("Stop".equals(arg))
	{
	  monte.stop();
	  stopped=true;
	}
      else if("Run".equals(arg))
	{
	  if (!monte.isAlive())
	    {
	      stopped=false;
	      monte=new Thread(this);
	      monte.start();
	    }
	}
      else if("Change".equals(arg))
	{
	  mode = (mode + 1) % 3;
	  m.mode=mode;
	  l.setText(algorithmName[mode]);
	}
      return true;
    }

  public static void main(String args[]) {
    Frame frame=new Frame("Monte-Carlo");
    Monte mc=new Monte();

    mc.init();
    mc.start();

    frame.add("Center",mc);
    frame.resize(frame.preferredSize());
    frame.show();
  }
}

class Matter extends Panel
{
  int n=40;
  int spins[];
  int p2n[],p2s[],p2e[],p2w[];
  int is[],nis[];
  boolean be[],bs[];
  public int mode=0;
  double temp=1.0;
  Random r0;
//
//   H = - \sum_{<ij>} Si Sj , Si = \pm 1
//   Z = \sum_{S} \exp(-H(S)/T)
//   Tc=2/ln(1+sqrt 2)
//
  static final double Tc=2.26918531421302;

  Matter(int x)
    {
      n=x;
      spins = new int[n*n];
      p2n = new int[n*n];
      p2s = new int[n*n];
      p2e = new int[n*n];
      p2w = new int[n*n];
      is = new int[n*n];
      nis = new int[n*n];
      be = new boolean[n*n];
      bs = new boolean[n*n];
      for (int i = 0 ; i < n ; i++)
	for (int j = 0 ; j < n ; j++)
	{
	  spins[i*n+j]=-1;
	  p2n[i*n+j]=((i+n-1)%n)*n+j;
	  p2s[i*n+j]=((i+1)%n)*n+j;
	  p2e[i*n+j]=i*n+(j+1)%n;
	  p2w[i*n+j]=i*n+(j+n-1)%n;
	}
      r0 = new Random();
      resize((n+4)*8,n*8);
    }

  public synchronized void step()
    {
      if(mode == 0)
	{
	  for (int i = 0 ; i < n*n ; i++)
	    {
	      double dw=
		Math.exp((double)-(2*spins[i]*
		   (spins[p2n[i]]+spins[p2s[i]]+spins[p2e[i]]+spins[p2w[i]]))
			 /(temp*Tc));
		if(r0.nextDouble() <= dw)
		  spins[i]*=-1;
	      }
	}
      else if(mode == 1)
	{
	  for(int i=0;i<n*n;i++)
	    {
	      is[i]=i;
	      nis[i]=1;
	      be[i]=false;
	      bs[i]=false;
	    }
	  for(int i=0;i<n*n;i++)
	    {
	      if(spins[i] == spins[p2e[i]]
		 && r0.nextDouble() > Math.exp(-2e0/(temp*Tc)))
		{
		  be[i]=true;
		  join(i,p2e[i]);
		}
	      if(spins[i] == spins[p2s[i]]
		 && r0.nextDouble() > Math.exp(-2e0/(temp*Tc)))
		{
		  bs[i]=true;
		  join(i,p2s[i]);
		}
	    }
	  for(int i=0;i<n*n;i++)
	    {
	      if(is[i]==i)
		spins[i]*=((int)(r0.nextDouble()*2e0)*2-1);
	      else
		is[i]=search(i);
	    }
	  for(int i=0;i<n*n;i++)
	    spins[i]=spins[is[i]];
	}
      else if(mode == 2)
	{
	  for(int i=0;i<n*n;i++)
	    {
	      is[i]=i;
	      nis[i]=1;
	      be[i]=false;
	      bs[i]=false;
	    }
	  for(int i=0;i<n*n;i++)
	    {
	      if(spins[i] == spins[p2e[i]]
		 && r0.nextDouble() > Math.exp(-2e0/(temp*Tc)))
		{
		  join(i,p2e[i]);
		  be[i]=true;
		}
	      if(spins[i] == spins[p2s[i]]
		 && r0.nextDouble() > Math.exp(-2e0/(temp*Tc)))
		{
		  join(i,p2s[i]);
		  bs[i]=true;
		}
	    }
	  int i0=(int)(r0.nextDouble()*(double)(n*n));
	  i0=search(i0);
	  for(int i=0;i<n*n;i++)
	    is[i]=search(i);
	  for(int i=0;i<n*n;i++)
	    {
	      if(is[i]==i0)
		spins[i]*=-1;
	      else{
		if(be[i]==false && is[p2e[i]]!=i0)
		  be[i]=true;
		if(bs[i]==false && is[p2s[i]]!=i0)
		  bs[i]=true;
	      }
	    }
	}
    }

  public void join(int i,int j)
    {
      while(is[i]!=i)
	i=is[i];
      while(is[j]!=j)
	j=is[j];
      if(i==j) return;
      if(nis[i]<nis[j])
	{
	  nis[j]=nis[j]+nis[i];
	  is[i]=j;
	}
      else
	{
	  nis[i]=nis[i]+nis[j];
	  is[j]=i;
	}
    }

  int search(int i)
    {
      while(is[i]!=i)
	i=is[i];
      return i;
    }

  public void paint(Graphics g)
    {
      paintBoard(g);
      paintMeter(g);
    }

  public synchronized void update(Graphics g)
    {
      paintBoard(g);
    }

  public void paintBoard(Graphics g)
    {
      g.setColor(Color.white);
      g.fillRect(16,0,n*8,n*8);
      g.setColor(Color.red);
      for (int i = 0 ; i < n ; i++)
	for (int j = 0 ; j < n ; j++)
	  {
	    if(spins[i*n+j] == 1)
	      g.fillRect(j*8+16,i*8,8,8);
	  }
      if(mode >= 1)
	{
	  g.setColor(Color.black);
	  for (int i = 0 ; i < n ; i++)
	    for (int j = 0 ; j < n ; j++)
	      {
		if(!be[i*n+j])
		  g.drawLine(j*8+7+16,i*8,j*8+7+16,i*8+7);
		if(!bs[i*n+j])
		  g.drawLine(j*8+16,i*8+7,j*8+7+16,i*8+7);
	      }
	}
    }

  public void paintMeter(Graphics g)
    {
      g.setColor(Color.white);
      g.fillRect((n+4)*8-1,0,16,n*8);
      g.setColor(Color.red);
      g.fillRect((n+4)*8-1,n*8-(int)((double)n*4e0*temp),
		 16,(int)((double)n*4e0*temp));
      g.setColor(Color.black); 
      for(int i=0;i<=10;i++)
	{
	  g.drawLine((n+2)*8-1+16,(int)((double)(i*n)*0.8),
		     (n+2)*8+16+16,(int)((double)(i*n)*0.8));
	  g.drawString(new Double((double)((10-i)*2)/10e0).toString(),
		       (n+2)*8-1+16,(int)((double)(i*n)*0.8));
	}
    }

  public boolean mouseDown(Event evt, int x, int y)
    {
      if(x >= (n+2)*8 && y >= 0 && y < 320)
	{
	  temp = 2e0-(double)y/((double)n*4e0);
	  paintMeter(getGraphics());
	}
      return true;
    }
}
